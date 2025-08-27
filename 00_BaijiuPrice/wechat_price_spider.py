import requests
import csv
import re
from bs4 import BeautifulSoup
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MoutaiPriceScraper:
    def __init__(self, url):
        self.url = url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Referer': 'https://mp.weixin.qq.com/',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"macOS"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0'
        })
    
    def fetch_page(self):
        """Fetch the page content"""
        try:
            response = self.session.get(self.url, timeout=30)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            logger.error(f"Error fetching page: {e}")
            return None
    
    def parse_tables(self, html_content):
        """Parse all tables on the page and extract relevant data"""
        if not html_content:
            return []
        
        soup = BeautifulSoup(html_content, 'html.parser')
        tables = soup.find_all('table')
        
        all_data = []
        
        for table in tables:
            # Try to find brand name by looking at previous elements
            brand_element = table.find_previous('p')
            brand_name = None
            
            # Look for potential brand names in previous paragraph elements
            while brand_element and not brand_name:
                text = brand_element.get_text(strip=True)
                # Check if this contains a potential brand name
                if text and len(text) < 20 and '茅台' in text:
                    brand_name = text
                    break
                # If not found, check previous paragraph
                brand_element = brand_element.find_previous('p')
            
            # If still no brand found, try to find from image alt or table caption
            if not brand_name:
                img = table.find_previous('img')
                if img and img.get('alt'):
                    brand_name = img.get('alt')
                    if '茅台' in brand_name:
                        brand_name = brand_name.strip()
                    else:
                        brand_name = None
            
            # Default to table name or section heading if available
            if not brand_name:
                heading = table.find_previous(['h1', 'h2', 'h3', 'h4', 'h5'])
                if heading:
                    brand_name = heading.get_text(strip=True)
                    
            # If still no brand, use a default identifier based on table position
            if not brand_name:
                brand_name = self._extract_brand_from_table(table)
            
            # Process the table rows
            table_data = self._process_table(table, brand_name)
            all_data.extend(table_data)
        
        return all_data
    
    def _extract_brand_from_table(self, table):
        """Try to extract brand from table content or header row"""
        # Look for logo or brand cell in first rows
        first_cell = table.find('td')
        if first_cell and first_cell.find('img'):
            img = first_cell.find('img')
            if img.get('alt'):
                return img.get('alt')
        
        # Check first row for potential brand name
        header_row = table.find('tr')
        if header_row:
            cells = header_row.find_all('td')
            for cell in cells:
                text = cell.get_text(strip=True)
                if '酒' in text and len(text) < 10:
                    return text
        
        # Last resort: use content from a cell that might contain the brand
        first_row = table.find('tr')
        if first_row:
            cell = first_row.find('td')
            if cell:
                text = cell.get_text(strip=True)
                if text:
                    # Try to extract brand based on content
                    if '茅台' in text:
                        return '茅台'
                    elif '洋河' in text:
                        return '洋河'
                    elif '习酒' in text:
                        return '习酒'
        
        # If all else fails, use the content of the first non-empty cell
        for row in table.find_all('tr'):
            for cell in row.find_all('td'):
                text = cell.get_text(strip=True)
                if text and ('酒' in text):
                    return text
        
        # Absolute fallback
        return "未知品牌"
    
    def _process_table(self, table, brand_name):
        """Process a single table and extract product data"""
        rows = table.find_all('tr')
        
        # Check if this table has headers
        header_row = rows[0] if rows else None
        header_cells = header_row.find_all('td') if header_row else []
        headers = [cell.get_text(strip=True) for cell in header_cells]
        
        # Determine column indices
        name_idx = next((i for i, h in enumerate(headers) if '品名' in h), 0)
        spec_idx = next((i for i, h in enumerate(headers) if '规格' in h), 1)
        yday_idx = next((i for i, h in enumerate(headers) if '昨日' in h), 2)
        today_idx = next((i for i, h in enumerate(headers) if '今日' in h), 3)
        
        # Process data rows (skip header)
        table_data = []
        for row in rows[1:]:
            cells = row.find_all('td')
            if len(cells) < 2:  # Skip rows with insufficient data
                continue
            
            # Get cell text content safely
            if name_idx < len(cells):
                product_name = cells[name_idx].get_text(strip=True)
            else:
                product_name = "null"
                
            if spec_idx < len(cells):
                specifications = cells[spec_idx].get_text(strip=True)
            else:
                specifications = "null"
                
            if yday_idx < len(cells):
                yesterday_price = cells[yday_idx].get_text(strip=True)
            else:
                yesterday_price = "null"
                
            if today_idx < len(cells):
                today_price = cells[today_idx].get_text(strip=True)
            else:
                today_price = "null"
            
            # Skip rows that appear to be headers or footers with "更多" text
            if '更多' in product_name or '更多' in specifications:
                continue
                
            # Skip if the name is empty or just contains formatting characters
            if not product_name or product_name.isspace():
                continue
                
            # Format the product name as requested: {brand}-{product_name}
            formatted_name = f"{brand_name}-{product_name}"
            
            # Add to our dataset
            table_data.append({
                'product_name': formatted_name,
                'specifications': specifications,
                'yesterday_price': yesterday_price,
                'today_price': today_price
            })
        
        return table_data
    
    def save_to_csv(self, data, filename=None):
        """Save scraped data to a CSV file"""
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'moutai_prices_{timestamp}.csv'
        
        if not data:
            logger.warning("No data to save to CSV.")
            return False
        
        try:
            with open(filename, 'w', newline='', encoding='utf-8-sig') as csvfile:
                fieldnames = ['product_name', 'specifications', 'yesterday_price', 'today_price']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                writer.writeheader()
                for row in data:
                    writer.writerow(row)
                
            logger.info(f"Data successfully saved to {filename}")
            return True
        except Exception as e:
            logger.error(f"Error saving data to CSV: {e}")
            return False
    
    def run(self, output_filename=None):
        """Run the complete scraping process"""
        logger.info(f"Starting scrape of {self.url}")
        
        # Fetch page content
        html_content = self.fetch_page()
        if not html_content:
            logger.error("Failed to retrieve page content.")
            return False
        
        # Parse tables and extract data
        data = self.parse_tables(html_content)
        if not data:
            logger.warning("No data extracted from tables.")
            return False
        
        # Save data to CSV
        success = self.save_to_csv(data, output_filename)
        
        return success


if __name__ == "__main__":
    url = "https://mp.weixin.qq.com/s/pWTm7tgpXJYJNqcTXnpjew"
    output_file = "moutai_prices_data.csv"
    
    scraper = MoutaiPriceScraper(url)
    success = scraper.run(output_file)
    
    if success:
        print(f" Scraping completed successfully. Data saved to {output_file}")
    else:
        print(" Scraping process encountered issues. Check logs for details.")
