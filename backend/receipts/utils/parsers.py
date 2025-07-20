import re
import PyPDF2
from datetime import datetime, date
from decimal import Decimal
from typing import Dict, Optional, Tuple
import io
from PIL import Image

class ReceiptParser:
    """Rule-based receipt parsing with OCR fallback - INR Version"""
    
    VENDOR_PATTERNS = {
        'reliance fresh': r'reliance\s*fresh',
        'reliance digital': r'reliance\s*digital',
        'big bazaar': r'big\s*bazaar',
        'dmart': r'd[-\s]*mart',
        'spencer\'s': r'spencer\'?s',
        'more': r'more\s*supermarket',
        'star bazaar': r'star\s*bazaar',
        'easyday': r'easyday',
        'metro': r'metro\s*cash',
        'walmart': r'wal[-\s]*mart',
        'amazon': r'amazon',
        'flipkart': r'flipkart',
        'myntra': r'myntra',
        'swiggy': r'swiggy',
        'zomato': r'zomato',
        'ola': r'ola',
        'uber': r'uber',
        'cafe coffee day': r'cafe\s*coffee\s*day|ccd',
        'starbucks': r'starbucks',
        'dominos': r'domino\'?s',
        'pizza hut': r'pizza\s*hut',
        'kfc': r'kfc',
        'mcdonald\'s': r'mcdonald\'?s',
        'burger king': r'burger\s*king',
        'subway': r'subway',
        'haldiram\'s': r'haldiram\'?s',
        'bikanervala': r'bikanervala',
        'saravana bhavan': r'saravana\s*bhavan',
        'udupi': r'udupi',
        'cafe': r'cafe',
        'restaurant': r'restaurant',
        'hotel': r'hotel',
        'petrol pump': r'petrol\s*pump',
        'hp': r'\bhp\b',
        'iocl': r'iocl',
        'bharat petroleum': r'bharat\s*petroleum',
        'essar': r'essar',
    }
    
    CATEGORY_MAPPING = {
        'reliance fresh': 'groceries',
        'reliance digital': 'shopping',
        'big bazaar': 'groceries',
        'dmart': 'groceries',
        'spencer\'s': 'groceries',
        'more': 'groceries',
        'star bazaar': 'groceries',
        'easyday': 'groceries',
        'metro': 'groceries',
        'walmart': 'groceries',
        'amazon': 'shopping',
        'flipkart': 'shopping',
        'myntra': 'shopping',
        'swiggy': 'restaurant',
        'zomato': 'restaurant',
        'cafe coffee day': 'restaurant',
        'starbucks': 'restaurant',
        'dominos': 'restaurant',
        'pizza hut': 'restaurant',
        'kfc': 'restaurant',
        'mcdonald\'s': 'restaurant',
        'burger king': 'restaurant',
        'subway': 'restaurant',
        'haldiram\'s': 'restaurant',
        'bikanervala': 'restaurant',
        'saravana bhavan': 'restaurant',
        'udupi': 'restaurant',
        'cafe': 'restaurant',
        'restaurant': 'restaurant',
        'hotel': 'restaurant',
        'ola': 'transportation',
        'uber': 'transportation',
        'petrol pump': 'transportation',
        'hp': 'transportation',
        'iocl': 'transportation',
        'bharat petroleum': 'transportation',
        'essar': 'transportation',
        'electricity': 'electricity',
        'power': 'electricity',
        'electric': 'electricity',
        'internet': 'internet',
        'telecom': 'internet',
        'mobile': 'internet',
        'airtel': 'internet',
        'jio': 'internet',
        'vodafone': 'internet',
        'vi': 'internet',
        'bsnl': 'internet',
    }
    
    def __init__(self):
        self.amount_patterns = [
            r'₹\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',  # ₹1,250.50 or ₹250.50
            r'rs\.?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',  # Rs. 1,250.50 or Rs 250.50
            r'inr\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',  # INR 1,250.50
            r'total\s*:?\s*₹?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',  # Total: ₹1,250.50
            r'amount\s*:?\s*₹?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',  # Amount: ₹1,250.50
            r'grand\s*total\s*:?\s*₹?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',  # Grand Total: ₹1,250.50
            r'net\s*amount\s*:?\s*₹?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',  # Net Amount: ₹1,250.50
            r'(\d+(?:,\d{3})*\.\d{2})',  # 1,250.50 (fallback with decimal)
        ]
        
        self.date_patterns = [
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',  # DD/MM/YYYY or MM/DD/YYYY
            r'(\d{4}[/-]\d{1,2}[/-]\d{1,2})',  # YYYY/MM/DD
            r'(\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{2,4})',  # DD MMM YYYY
            r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*\d{1,2},?\s*\d{2,4}',  # MMM DD, YYYY
        ]
    
    def parse_file(self, file) -> Dict:
        """Main parsing method"""
        try:
            file_extension = file.name.lower().split('.')[-1]
            
            if file_extension == 'pdf':
                text = self._extract_pdf_text(file)
            elif file_extension == 'txt':
                text = file.read().decode('utf-8')
            elif file_extension in ['jpg', 'jpeg', 'png']:
                text = self._extract_image_text(file)
            else:
                raise ValueError(f"Unsupported file type: {file_extension}")
            
            return self._parse_text(text)
            
        except Exception as e:
            return {
                'vendor': 'Unknown',
                'amount': Decimal('0.00'),
                'transaction_date': date.today(),
                'category': 'other',
                'raw_text': str(e),
                'confidence_score': 0.0
            }
    
    def _extract_pdf_text(self, file) -> str:
        """Extract text from PDF"""
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    
    def _extract_image_text(self, file) -> str:
        """Extract text from image using OCR"""
        try:
            image = Image.open(file)
            # Try to import pytesseract, fallback gracefully if not available
            try:
                import pytesseract
                text = pytesseract.image_to_string(image)
                return text
            except ImportError:
                print("Warning: pytesseract not available. OCR functionality disabled.")
                return "OCR not available - please install pytesseract"
        except Exception as e:
            return f"Error processing image: {str(e)}"
    
    def _parse_text(self, text: str) -> Dict:
        """Parse extracted text for receipt data"""
        text_lower = text.lower()
        
        # Extract vendor
        vendor, confidence = self._extract_vendor(text_lower)
        
        # Extract amount
        amount = self._extract_amount(text_lower)
        
        # Extract date
        transaction_date = self._extract_date(text_lower)
        
        # Determine category
        category = self._determine_category(vendor, text_lower)
        
        return {
            'vendor': vendor,
            'amount': amount,
            'transaction_date': transaction_date,
            'category': category,
            'raw_text': text,
            'confidence_score': confidence
        }
    
    def _extract_vendor(self, text: str) -> Tuple[str, float]:
        """Extract vendor name with confidence score"""
        for vendor, pattern in self.VENDOR_PATTERNS.items():
            if re.search(pattern, text, re.IGNORECASE):
                return vendor.title(), 0.8
        
        # Fallback: extract first line or common business patterns
        lines = text.split('\n')
        for line in lines[:3]:  # Check first 3 lines
            line = line.strip()
            if len(line) > 2 and not re.match(r'^\d', line):
                return line[:50], 0.3
        
        return "Unknown Vendor", 0.1
    
    def _extract_amount(self, text: str) -> Decimal:
        """Extract monetary amount"""
        amounts = []
        
        for pattern in self.amount_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    # Remove commas from Indian number format
                    clean_amount = match.replace(',', '')
                    amount = Decimal(clean_amount)
                    if amount > 0:
                        amounts.append(amount)
                except:
                    continue
        
        # Return the largest reasonable amount
        if amounts:
            # Filter out very large amounts (likely errors)
            reasonable_amounts = [a for a in amounts if a < 100000]  # Less than ₹1 lakh
            if reasonable_amounts:
                return max(reasonable_amounts)
            return max(amounts)
        
        return Decimal('0.00')
    
    def _extract_date(self, text: str) -> date:
        """Extract transaction date"""
        for pattern in self.date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    # Handle different date formats
                    if isinstance(match, tuple):
                        match = ' '.join(match)
                    
                    # Try different date formats (Indian DD/MM/YYYY preference)
                    date_formats = [
                        '%d/%m/%Y', '%d-%m-%Y',  # DD/MM/YYYY (Indian format)
                        '%m/%d/%Y', '%m-%d-%Y',  # MM/DD/YYYY (US format)
                        '%Y/%m/%d', '%Y-%m-%d',  # YYYY/MM/DD (ISO format)
                        '%d %b %Y', '%d %B %Y',  # DD MMM YYYY
                        '%b %d, %Y', '%B %d, %Y'  # MMM DD, YYYY
                    ]
                    
                    for fmt in date_formats:
                        try:
                            return datetime.strptime(match, fmt).date()
                        except:
                            continue
                except:
                    continue
        
        return date.today()
    
    def _determine_category(self, vendor: str, text: str) -> str:
        """Determine receipt category"""
        vendor_lower = vendor.lower()
        
        # Check vendor mapping
        for key, category in self.CATEGORY_MAPPING.items():
            if key in vendor_lower:
                return category
        
        # Check text content for category keywords
        for key, category in self.CATEGORY_MAPPING.items():
            if key in text:
                return category
        
        return 'other'