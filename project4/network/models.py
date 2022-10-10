from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass
    following = models.ManyToManyField("self", blank=True, related_name='followers', symmetrical=False)


class Post(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.CharField(max_length=5000)
    timeCreated = models.DateTimeField(auto_now_add=True)
    liked_by = models.ManyToManyField(User, blank=True, related_name='likes')

    def __str__(self):
        return f"{self.creator}"

    
    def likes(self):
        # total number of likes for a post
        return self.liked_by.all().count()

    class Meta:
        # Orders posts by most recent first
        ordering = ['-timeCreated']


