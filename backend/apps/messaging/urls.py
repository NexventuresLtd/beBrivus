from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('conversations', views.ConversationViewSet, basename='conversations')
router.register('messages', views.MessageViewSet, basename='messages')

urlpatterns = [
    path('', include(router.urls)),
]
