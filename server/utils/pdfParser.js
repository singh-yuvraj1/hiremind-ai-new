// ============================================================
//  utils/pdfParser.js  —  HireMind AI
//  Extracts plain text from PDF buffer using pdf-parse.
//  Falls back gracefully if the library is not installed.
// ============================================================

/**
 * Try to load pdf-parse. If it's not installed yet, we surface
 * a helpful error instead of crashing the whole server.
 */
let pdfParse = null;
try {
  pdfParse = require('pdf-parse');
} catch {
  console.warn(
    '[pdfParser] pdf-parse not installed. Run: npm install pdf-parse\n' +
    '            PDF uploads will be rejected until the package is installed.'
  );
}

/**
 * Extract plain text from a PDF file buffer.
 *
 * @param {Buffer} buffer  — raw file buffer (from multer memoryStorage)
 * @returns {Promise<{ text: string, pages: number, info: object }>}
 * @throws {Error} if pdf-parse is not installed or the buffer is not a valid PDF
 */
const extractTextFromPDF = async (buffer) => {
  if (!pdfParse) {
    throw new Error(
      'pdf-parse package is not installed. Run "npm install pdf-parse" in the server directory.'
    );
  }

  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error('Invalid or empty PDF buffer.');
  }

  // Quick magic-number check — PDFs start with "%PDF"
  if (buffer.slice(0, 4).toString() !== '%PDF') {
    throw new Error('Uploaded file does not appear to be a valid PDF.');
  }

  const data = await pdfParse(buffer, {
    // Disable font-rendering to speed things up — we only need text
    renderPage: () => '',
  });

  const text = (data.text || '').trim();

  if (text.length < 20) {
    throw new Error(
      'Could not extract readable text from this PDF. ' +
      'The file may be image-based (scanned). Please upload a text-based PDF or paste your resume text.'
    );
  }

  return {
    text,
    pages:    data.numpages || 1,
    info:     data.info     || {},
    wordCount: text.split(/\s+/).filter(Boolean).length,
  };
};

/**
 * Convenience: check whether pdf-parse is available.
 * Useful for health-check endpoints or boot-time logging.
 */
const isPdfParseAvailable = () => pdfParse !== null;

module.exports = { extractTextFromPDF, isPdfParseAvailable };
