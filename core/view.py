from django.shortcuts import render, redirect
from django.contrib.auth import logout, login
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .utils import is_ajax, classify_face
import base64
from logs.models import Log
from django.core.files.base import ContentFile
from django.contrib.auth.models import User
from profiles.models import Profile
def login_view(request):
    return render (request, 'login.html', {})
def logout_view (request):
    logout(request)
    return redirect('login')

@login_required
def home_view (request):
    return render (request, 'main.html',{})
# {} doesnt pass anything to particular template
def find_user_view(request):
    # if able to find user 
    if is_ajax(request):
        photo = request.POST.get('photo')
        _, str_img = photo.split(';base64')
        decodedFile = base64.b64decode(str_img)
        x = Log()
        x.photo = ContentFile(decodedFile, 'upload.png')
        x.save()
        res = classify_face(x.photo.path)
        if(res=='Unknown'):
            raise Exception("Unknown user!")
        user_exists = User.objects.filter(username=res).exists()
        if user_exists:
            user = User.objects.get(username=res)
            profile = Profile.objects.get(user=user)
            x.profile = profile
            x.save()

            login(request, user)
            return JsonResponse({'success': True})
        return JsonResponse({'success': False})
