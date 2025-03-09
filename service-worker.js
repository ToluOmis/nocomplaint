{\rtf1\ansi\ansicpg1251\cocoartf2821
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const CACHE_NAME = 'no-complaint-cache-v1';\
const urlsToCache = [\
  './',\
  './index.html',\
  './manifest.json',\
  // \uc0\u1053 \u1077  \u1079 \u1072 \u1073 \u1091 \u1076 \u1100 \u1090 \u1077  \u1076 \u1086 \u1073 \u1072 \u1074 \u1080 \u1090 \u1100  \u1087 \u1091 \u1090 \u1080  \u1082  \u1080 \u1082 \u1086 \u1085 \u1082 \u1072 \u1084 \
  './icons/icon-192x192.png',\
  './icons/icon-512x512.png'\
];\
\
self.addEventListener('install', event => \{\
  event.waitUntil(\
    caches.open(CACHE_NAME)\
      .then(cache => \{\
         return cache.addAll(urlsToCache);\
      \})\
  );\
\});\
\
self.addEventListener('fetch', event => \{\
  event.respondWith(\
    caches.match(event.request)\
      .then(response => response || fetch(event.request))\
  );\
\});\
}