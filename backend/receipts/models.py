from django.db import models
from django.core.validators import MinValueValidator
import uuid

class Receipt(models.Model):
    CATEGORY_CHOICES = [
        ('electricity', 'Electricity'),
        ('internet', 'Internet'),
        ('groceries', 'Groceries'),
        ('restaurant', 'Restaurant'),
        ('shopping', 'Shopping'),
        ('transportation', 'Transportation'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to='receipts/')
    vendor = models.CharField(max_length=200, db_index=True)
    transaction_date = models.DateField(db_index=True)
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(0)],
        db_index=True,
        help_text="Amount in INR"
    )
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    raw_text = models.TextField(blank=True)
    confidence_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['vendor', 'transaction_date']),
            models.Index(fields=['amount', 'transaction_date']),
            models.Index(fields=['category', 'transaction_date']),
        ]
        ordering = ['-transaction_date', '-created_at']
        verbose_name = "Receipt"
        verbose_name_plural = "Receipts"
    
    def __str__(self):
        return f"{self.vendor} - ₹{self.amount} ({self.transaction_date})"
    
    def formatted_amount(self):
        """Return formatted amount in Indian currency format"""
        return f"₹{self.amount:,.2f}"
    
    @property
    def amount_in_words(self):
        """Convert amount to words (optional feature)"""
        # This could be expanded to convert numbers to Indian words
        return f"Rupees {self.amount}"