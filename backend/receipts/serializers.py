from rest_framework import serializers
from .models import Receipt

class ReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receipt
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

class ReceiptUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    
    def validate_file(self, value):
        from .utils.validators import validate_file_type
        validate_file_type(value)
        return value

class ReceiptUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receipt
        fields = ['vendor', 'transaction_date', 'amount', 'category']
