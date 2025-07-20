from typing import List, Dict, Any, Optional
from datetime import date, datetime, timedelta
from decimal import Decimal
from collections import defaultdict, Counter
import statistics
import heapq

class ReceiptAnalytics:
    """Algorithmic implementations for receipt analysis"""
    
    @staticmethod
    def linear_search(receipts: List[Dict], field: str, value: Any) -> List[Dict]:
        """Linear search implementation - O(n)"""
        results = []
        for receipt in receipts:
            if receipt.get(field) == value:
                results.append(receipt)
        return results
    
    @staticmethod
    def binary_search_by_date(receipts: List[Dict], target_date: date) -> Optional[Dict]:
        """Binary search on sorted receipts by date - O(log n)"""
        if not receipts:
            return None
        
        # Ensure receipts are sorted by date
        sorted_receipts = sorted(receipts, key=lambda x: x['transaction_date'])
        
        left, right = 0, len(sorted_receipts) - 1
        
        while left <= right:
            mid = (left + right) // 2
            mid_date = sorted_receipts[mid]['transaction_date']
            
            if mid_date == target_date:
                return sorted_receipts[mid]
            elif mid_date < target_date:
                left = mid + 1
            else:
                right = mid - 1
        
        return None
    
    @staticmethod
    def quick_sort_by_amount(receipts: List[Dict], reverse: bool = True) -> List[Dict]:
        """Quicksort implementation - Average O(n log n)"""
        if len(receipts) <= 1:
            return receipts
        
        pivot = receipts[len(receipts) // 2]['amount']
        left = [x for x in receipts if x['amount'] < pivot]
        middle = [x for x in receipts if x['amount'] == pivot]
        right = [x for x in receipts if x['amount'] > pivot]
        
        if reverse:
            return (ReceiptAnalytics.quick_sort_by_amount(right, reverse) + 
                   middle + 
                   ReceiptAnalytics.quick_sort_by_amount(left, reverse))
        else:
            return (ReceiptAnalytics.quick_sort_by_amount(left, reverse) + 
                   middle + 
                   ReceiptAnalytics.quick_sort_by_amount(right, reverse))
    
    @staticmethod
    def merge_sort_by_vendor(receipts: List[Dict]) -> List[Dict]:
        """Merge sort implementation - O(n log n)"""
        if len(receipts) <= 1:
            return receipts
        
        mid = len(receipts) // 2
        left = ReceiptAnalytics.merge_sort_by_vendor(receipts[:mid])
        right = ReceiptAnalytics.merge_sort_by_vendor(receipts[mid:])
        
        return ReceiptAnalytics._merge_by_vendor(left, right)
    
    @staticmethod
    def _merge_by_vendor(left: List[Dict], right: List[Dict]) -> List[Dict]:
        """Helper method for merge sort"""
        result = []
        i = j = 0
        
        while i < len(left) and j < len(right):
            if left[i]['vendor'].lower() <= right[j]['vendor'].lower():
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1
        
        result.extend(left[i:])
        result.extend(right[j:])
        return result
    
    @staticmethod
    def compute_statistics(receipts: List[Dict]) -> Dict[str, Any]:
        """Compute statistical aggregates"""
        if not receipts:
            return {}
        
        amounts = [float(receipt['amount']) for receipt in receipts]
        
        return {
            'total_spend': sum(amounts),
            'mean_spend': statistics.mean(amounts),
            'median_spend': statistics.median(amounts),
            'mode_spend': statistics.mode(amounts) if len(set(amounts)) < len(amounts) else None,
            'min_spend': min(amounts),
            'max_spend': max(amounts),
            'std_deviation': statistics.stdev(amounts) if len(amounts) > 1 else 0,
            'count': len(receipts)
        }
    
    @staticmethod
    def vendor_frequency_analysis(receipts: List[Dict]) -> Dict[str, int]:
        """Frequency distribution of vendors"""
        vendor_counts = Counter(receipt['vendor'] for receipt in receipts)
        return dict(vendor_counts.most_common())
    
    @staticmethod
    def category_distribution(receipts: List[Dict]) -> Dict[str, Dict]:
        """Category-wise spending analysis"""
        category_data = defaultdict(lambda: {'count': 0, 'total': 0, 'receipts': []})
        
        for receipt in receipts:
            category = receipt['category']
            category_data[category]['count'] += 1
            category_data[category]['total'] += float(receipt['amount'])
            category_data[category]['receipts'].append(receipt)
        
        # Convert defaultdict to regular dict
        return {k: dict(v) for k, v in category_data.items()}
    
    @staticmethod
    def time_series_analysis(receipts: List[Dict], window_days: int = 30) -> Dict[str, List]:
        """Time-series analysis with moving averages"""
        if not receipts:
            return {'dates': [], 'amounts': [], 'moving_avg': []}
        
        # Sort by date
        sorted_receipts = sorted(receipts, key=lambda x: x['transaction_date'])
        
        # Group by date
        daily_totals = defaultdict(float)
        for receipt in sorted_receipts:
            daily_totals[receipt['transaction_date']] += float(receipt['amount'])
        
        dates = sorted(daily_totals.keys())
        amounts = [daily_totals[date] for date in dates]
        
        # Calculate moving averages
        moving_averages = []
        for i in range(len(amounts)):
            start_idx = max(0, i - window_days + 1)
            window = amounts[start_idx:i + 1]
            moving_averages.append(sum(window) / len(window))
        
        return {
            'dates': [date.isoformat() for date in dates],
            'amounts': amounts,
            'moving_avg': moving_averages
        }
    
    @staticmethod
    def range_search(receipts: List[Dict], min_amount: float, max_amount: float) -> List[Dict]:
        """Search receipts within amount range"""
        return [
            receipt for receipt in receipts 
            if min_amount <= float(receipt['amount']) <= max_amount
        ]
    
    @staticmethod
    def pattern_search(receipts: List[Dict], field: str, pattern: str) -> List[Dict]:
        """Pattern-based search using string matching"""
        import re
        results = []
        pattern_regex = re.compile(pattern, re.IGNORECASE)
        
        for receipt in receipts:
            field_value = str(receipt.get(field, ''))
            if pattern_regex.search(field_value):
                results.append(receipt)
        
        return results
    
    @staticmethod
    def top_k_vendors(receipts: List[Dict], k: int = 10) -> List[Dict]:
        """Find top K vendors by spending using heap - O(n log k)"""
        vendor_totals = defaultdict(float)
        
        for receipt in receipts:
            vendor_totals[receipt['vendor']] += float(receipt['amount'])
        
        # Use heap to find top K
        top_vendors = heapq.nlargest(k, vendor_totals.items(), key=lambda x: x[1])
        
        return [{'vendor': vendor, 'total_spend': total} for vendor, total in top_vendors]
