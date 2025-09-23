from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'opportunities'

router = DefaultRouter()
router.register('', views.OpportunityViewSet, basename='opportunity')

urlpatterns = [
    path('', include(router.urls)),
    path('search/', views.OpportunitySearchView.as_view(), name='opportunity-search'),
    path('<int:opportunity_id>/apply/', views.ApplyToOpportunityView.as_view(), name='apply'),
    path('<int:opportunity_id>/save/', views.SaveOpportunityView.as_view(), name='save'),
]
