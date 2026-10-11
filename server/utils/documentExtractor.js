// ============================================================
//  utils/documentExtractor.js  —  HireMind AI
//  Robust document text extraction for PDF, DOCX, and TXT files.
//  Validates magic bytes, detects corruption, empty files,
//  and image-only scanned PDFs without crashing or returning fake scores.
// ============================================================

let pdfParse = null;
try {
  pdfParse = require('pdf-parse');
} catch {
  console.warn('[documentExtractor] pdf-parse not installed.');
}

let mammoth = null;
try {
  mammoth = require('mammoth');
} catch {
  console.warn('[documentExtractor] mammoth not installed.');
}

/**
 * Identify file format using magic bytes and filename extension.
 * @param {Buffer} buffer
 * @param {string} originalName
 * @returns {'pdf' | 'docx' | 'txt' | 'unknown'}
 */
const detectFileType = (buffer, originalName = '') => {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4) {
    return 'unknown';
  }

  const nameLow = (originalName || '').toLowerCase();

  // PDF magic bytes: %PDF (0x25 0x50 0x44 0x46)
  if (buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return 'pdf';
  }

  // ZIP / DOCX magic bytes: PK\x03\x04 (0x50 0x4B 0x03 0x04)
  if (buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04) {
    if (nameLow.endsWith('.docx') || nameLow.endsWith('.doc')) {
      return 'docx';
    }
    // Could still be a docx without proper extension
    return 'docx';
  }

  if (nameLow.endsWith('.pdf')) return 'pdf';
  if (nameLow.endsWith('.docx')) return 'docx';
  if (nameLow.endsWith('.txt')) return 'txt';

  // Check if buffer is predominantly printable ASCII/UTF-8 text
  let printableCount = 0;
  const sampleLen = Math.min(buffer.length, 512);
  for (let i = 0; i < sampleLen; i++) {
    const byte = buffer[i];
    if (byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte <= 126) || byte >= 128) {
      printableCount++;
    }
  }
  if (printableCount / sampleLen > 0.85) {
    return 'txt';
  }

  return 'unknown';
};

/**
 * Extract plain text from PDF buffer.
 * @param {Buffer} buffer
 * @returns {Promise<{ text: string, pages: number, wordCount: number, isScanned: boolean }>}
 */
const extractFromPDF = async (buffer) => {
  if (!pdfParse) {
    throw new Error('PDF parsing library is not available on the server.');
  }

  let data;
  try {
    data = await pdfParse(buffer);
  } catch (err) {
    throw new Error(`Failed to parse PDF document: ${err.message || 'Corrupted or password-protected PDF.'}`);
  }

  const text = (data.text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  const pages = Math.max(1, data.numpages || 1);
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Detect scanned / image-only PDFs
  // If document has multiple pages or is larger than 10KB but extracted text is virtually empty
  const isScanned = text.length < 50 && (pages >= 1 || buffer.length > 5000);

  return {
    text,
    pages,
    wordCount,
    isScanned,
  };
};

/**
 * Extract plain text from DOCX buffer.
 * @param {Buffer} buffer
 * @returns {Promise<{ text: string, pages: number, wordCount: number }>}
 */
const extractFromDOCX = async (buffer) => {
  if (!mammoth) {
    throw new Error('DOCX parsing library is not available on the server.');
  }

  let result;
  try {
    result = await mammoth.extractRawText({ buffer });
  } catch (err) {
    throw new Error(`Failed to parse DOCX document: ${err.message || 'Corrupted Word document.'}`);
  }

  const text = (result.value || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  // Estimate ~350 words per page for DOCX
  const pages = Math.max(1, Math.ceil(wordCount / 350));

  return {
    text,
    pages,
    wordCount,
    isScanned: false,
  };
};

/**
 * Universal document extraction function.
 * @param {Buffer} buffer
 * @param {string} originalName
 * @returns {Promise<{
 *   success: boolean,
 *   text?: string,
 *   fileType: string,
 *   fileName: string,
 *   fileSizeBytes: number,
 *   pageCount: number,
 *   wordCount: number,
 *   charCount: number,
 *   extractionStatus: 'success' | 'empty' | 'unreadable_scanned' | 'unsupported_format' | 'corrupted',
 *   error?: string
 * }>}
 */
const extractDocumentText = async (buffer, originalName = 'resume') => {
  const fileSizeBytes = buffer ? buffer.length : 0;

  if (!Buffer.isBuffer(buffer) || fileSizeBytes === 0) {
    return {
      success: false,
      fileType: 'unknown',
      fileName: originalName,
      fileSizeBytes: 0,
      pageCount: 0,
      wordCount: 0,
      charCount: 0,
      extractionStatus: 'empty',
      error: 'Uploaded document is empty (0 bytes).',
    };
  }

  const fileType = detectFileType(buffer, originalName);

  if (fileType === 'unknown') {
    return {
      success: false,
      fileType: 'unknown',
      fileName: originalName,
      fileSizeBytes,
      pageCount: 0,
      wordCount: 0,
      charCount: 0,
      extractionStatus: 'unsupported_format',
      error: 'Unsupported file format. Please upload a PDF (.pdf), Word Document (.docx), or plain text (.txt) file.',
    };
  }

  try {
    let extracted;

    if (fileType === 'pdf') {
      extracted = await extractFromPDF(buffer);
    } else if (fileType === 'docx') {
      extracted = await extractFromDOCX(buffer);
    } else {
      // Plain text
      const text = buffer.toString('utf8').trim();
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      extracted = {
        text,
        pages: Math.max(1, Math.ceil(wordCount / 350)),
        wordCount,
        isScanned: false,
      };
    }

    if (extracted.isScanned) {
      return {
        success: false,
        fileType,
        fileName: originalName,
        fileSizeBytes,
        pageCount: extracted.pages,
        wordCount: extracted.wordCount,
        charCount: extracted.text.length,
        extractionStatus: 'unreadable_scanned',
        error: 'This document appears to be a scanned image or photo without selectable text. ATS parsers require text-based PDFs or DOCX files (OCR is required). Please upload a text-based document or paste your resume text.',
      };
    }

    if (!extracted.text || extracted.text.length < 50 || extracted.wordCount < 10) {
      return {
        success: false,
        fileType,
        fileName: originalName,
        fileSizeBytes,
        pageCount: extracted.pages,
        wordCount: extracted.wordCount,
        charCount: (extracted.text || '').length,
        extractionStatus: 'empty',
        error: 'The uploaded file does not contain sufficient readable text (minimum 50 characters required for ATS evaluation). Please upload your full resume.',
      };
    }

    return {
      success: true,
      text: extracted.text,
      fileType,
      fileName: originalName,
      fileSizeBytes,
      pageCount: extracted.pages,
      wordCount: extracted.wordCount,
      charCount: extracted.text.length,
      extractionStatus: 'success',
    };
  } catch (err) {
    return {
      success: false,
      fileType,
      fileName: originalName,
      fileSizeBytes,
      pageCount: 0,
      wordCount: 0,
      charCount: 0,
      extractionStatus: 'corrupted',
      error: err.message || 'Failed to extract text from the uploaded document.',
    };
  }
};

module.exports = {
  detectFileType,
  extractDocumentText,
  extractFromPDF,
  extractFromDOCX,
};
