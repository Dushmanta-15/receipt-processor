from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q, Sum, Count
from django.http import HttpResponse
from datetime import datetime, date
import csv
import json

from .models import Receipt
from .serializers import ReceiptSerializer, ReceiptUploadSerializer, ReceiptUpdateSerializer
from .utils.parsers import ReceiptParser
from .utils.algorithms import ReceiptAnalytics
from .utils.validators import ReceiptData, ValidationError

class ReceiptViewSet(viewsets.ModelViewSet):
    queryset = Receipt.objects.all()
    serializer_class = ReceiptSerializer
    parser_classes = (MultiPartParser, FormParser)
    
    def get_queryset(self):
        queryset = Receipt.objects.all()
        
        # Apply filters
        vendor = self.request.query_params.get('vendor')
        category = self.request.query_params.get('category')
        min_amount = self.request.query_params.get('min_amount')
        max_amount = self.request.query_params.get('max_amount')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        search = self.request.query_params.get('search')
        
        if vendor:
            queryset = queryset.filter(vendor__icontains=vendor)
        if category:
            queryset = queryset.filter(category=category)
        if min_amount:
            queryset = queryset.filter(amount__gte=min_amount)
        if max_amount:
            queryset = queryset.filter(amount__lte=max_amount)
        if start_date:
            queryset = queryset.filter(transaction_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(transaction_date__lte=end_date)
        if search:
            queryset = queryset.filter(
                Q(vendor__icontains=search) |
                Q(raw_text__icontains=search)
            )
        
        # Apply sorting
        sort_by = self.request.query_params.get('sort_by', '-transaction_date')
        queryset = queryset.order_by(sort_by)
        
        return queryset
    
    @action(detail=False, methods=['post'])
    def upload(self, request):
        """Upload and process receipt"""
        serializer = ReceiptUploadSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                file = serializer.validated_data['file']
                
                # Parse the receipt
                parser = ReceiptParser()
                parsed_data = parser.parse_file(file)
                
                # Validate parsed data
                receipt_data = ReceiptData(**parsed_data)
                
                # Create receipt record
                receipt = Receipt.objects.create(
                    file=file,
                    **receipt_data.dict()
                )
                
                return Response(
                    ReceiptSerializer(receipt).data,
                    status=status.HTTP_201_CREATED
                )
                
            except ValidationError as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                return Response(
                    {'error': f'Processing failed: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get analytics and insights"""
        receipts = list(self.get_queryset().values(
            'vendor', 'transaction_date', 'amount', 'category'
        ))
        
        analytics = ReceiptAnalytics()
        
        # Compute statistics
        stats = analytics.compute_statistics(receipts)
        
        # Vendor analysis
        vendor_freq = analytics.vendor_frequency_analysis(receipts)
        top_vendors = analytics.top_k_vendors(receipts, 10)
        
        # Category distribution
        category_dist = analytics.category_distribution(receipts)
        
        # Time series analysis
        time_series = analytics.time_series_analysis(receipts)
        
        return Response({
            'statistics': stats,
            'vendor_frequency': vendor_freq,
            'top_vendors': top_vendors,
            'category_distribution': category_dist,
            'time_series': time_series
        })
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Advanced search functionality"""
        query_type = request.query_params.get('type', 'keyword')
        query = request.query_params.get('q', '')
        
        receipts = list(self.get_queryset().values(
            'id', 'vendor', 'transaction_date', 'amount', 'category', 'raw_text'
        ))
        
        analytics = ReceiptAnalytics()
        
        if query_type == 'pattern':
            field = request.query_params.get('field', 'vendor')
            results = analytics.pattern_search(receipts, field, query)
        elif query_type == 'range':
            min_amount = float(request.query_params.get('min', 0))
            max_amount = float(request.query_params.get('max', 999999))
            results = analytics.range_search(receipts, min_amount, max_amount)
        else:  # keyword search
            results = analytics.linear_search(receipts, 'vendor', query)
        
        return Response({'results': results})
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export receipts as CSV or JSON"""
        format_type = request.query_params.get('format', 'csv')
        receipts = self.get_queryset()
        
        if format_type == 'json':
            data = ReceiptSerializer(receipts, many=True).data
            response = HttpResponse(
                json.dumps(data, indent=2, default=str),
                content_type='application/json'
            )
            response['Content-Disposition'] = 'attachment; filename="receipts.json"'
        else:  # CSV
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="receipts.csv"'
            
            writer = csv.writer(response)
            writer.writerow(['Vendor', 'Date', 'Amount', 'Category', 'Created'])
            
            for receipt in receipts:
                writer.writerow([
                    receipt.vendor,
                    receipt.transaction_date,
                    receipt.amount,
                    receipt.category,
                    receipt.created_at.strftime('%Y-%m-%d %H:%M:%S')
                ])
        
        return response
    
    def update(self, request, *args, **kwargs):
        """Update receipt with validation"""
        instance = self.get_object()
        serializer = ReceiptUpdateSerializer(instance, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(ReceiptSerializer(instance).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

