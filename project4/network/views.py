from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator

from .models import User, Post, Profile
from .forms import PostForm 
from .util import get_next_url, get_previous_url


def index(request):

    post = Post.objects.all()
    paginator = Paginator(post, 8) # Show 8 contacts per page.

    # Gets page number from query string in URL i.e '?page=' and if not, defaults to 1
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)  # the posts returned for each page is stored in page_obj
    return render(request, "network/index.html", {
        "form": PostForm(),
        "page_obj": page_obj,
        "next_url": get_next_url(page_obj),
        "previous_url": get_previous_url(page_obj)
    })


@login_required
def newPost(request):

    # Composing a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Store the user input in form variable
    form = PostForm(request.POST)

    # Checks if form is valid, saves new post into DB and redirects the user
    if form.is_valid():
        form.instance.creator = request.user
        form.save()
        return HttpResponseRedirect(reverse("index"))

    
def profile(request, user_id):
    
    # looks up the user's profile 
    profile_user = User.objects.get(pk=user_id)

    # Searches for relevant posts and separate posts into pages of 8
    profile_posts = Post.objects.filter(creator=user_id)
    paginator = Paginator(profile_posts, 8)

    # Gets page number from query string in URL '?page=' and if not, defaults to 1
    page_number = request.GET.get('page', 1)
    page = paginator.get_page(page_number)  # the posts returned for each page is stored in page

    # filter for users that are following this user
    if request.user.is_authenticated:
        following = profile_user.followers.filter(id=request.user.id).exists()
        print(following)
    else:
        following = False

    return render(request, "network/profile.html", {
        "profile_user": profile_user,
        "following": following, 
        "following_count": profile_user.following.all().count(),
        "followers_count": profile_user.followers.all().count(),
        "page": page,
        "previous_url": get_previous_url(page), 
        "next_url": get_next_url(page)
    })


@login_required(login_url='login')
def following(request):

    pass


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
