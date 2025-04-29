import pdfplumber
from docx import Document
from typing import Optional 

def extract_text_from_file(file_path: str, content_type: str) -> str:
    """
    Extract text content from various file types.
    
    Args:
        file_path: Path to the uploaded file
        content_type: MIME type of the file
        
    Returns:
        Extracted text content as string
    """
    try:
        if content_type == "application/pdf":
            return extract_text_from_pdf(file_path)
        elif content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return extract_text_from_docx(file_path)
        elif content_type == "text/plain":
            return extract_text_from_txt(file_path)
        else:
            raise ValueError(f"Unsupported file type: {content_type}")
    except Exception as e:
        raise Exception(f"Error extracting text from file: {str(e)}")

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file using pdfplumber."""
    text = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text.append(page.extract_text() or "")
    return "\n".join(text)

def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file using python-docx."""
    doc = Document(file_path)
    return "\n".join([paragraph.text for paragraph in doc.paragraphs])

def extract_text_from_txt(file_path: str) -> str:
    """Extract text from plain text file."""
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read() 
