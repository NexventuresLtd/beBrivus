from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a test admin user for development'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            default='admin@bebrivus.com',
            help='Admin email address (default: admin@bebrivus.com)'
        )
        parser.add_argument(
            '--password',
            default='admin123',
            help='Admin password (default: admin123)'
        )
        parser.add_argument(
            '--username',
            default='admin',
            help='Admin username (default: admin)'
        )

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        username = options['username']

        # Check if admin user already exists
        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f'Admin user with email {email} already exists')
            )
            return

        # Create admin user
        admin_user = User.objects.create_user(
            email=email,
            username=username,
            password=password,
            first_name='Admin',
            last_name='User',
            user_type='admin',
            is_staff=True,
            is_superuser=True,
            email_verified=True
        )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created admin user:\n'
                f'Email: {email}\n'
                f'Username: {username}\n'
                f'Password: {password}\n'
                f'User Type: {admin_user.user_type}\n'
                f'Is Staff: {admin_user.is_staff}\n'
                f'Is Superuser: {admin_user.is_superuser}'
            )
        )
