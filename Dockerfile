# stage 0: download and compile converter tools
FROM frolvlad/alpine-gcc AS tooling
WORKDIR /tmp
RUN apk add zlib-dev
RUN wget -O - http://m.m.i24.cc/osmconvert.c | cc -x c - -lz -O3 -o osmconvert
RUN wget -O - http://m.m.i24.cc/osmfilter.c |cc -x c - -O3 -o osmfilter

# stage 1: download and extract OSM data and perform pre-preprocessing
FROM alpine AS build
WORKDIR /tmp
COPY --from=tooling /tmp/osmconvert ./osmconvert
COPY --from=tooling /tmp/osmfilter ./osmfilter

ENV OSMDATA "https://download.bbbike.org/osm/bbbike/Dresden/Dresden.osm.gz"
ENV RELATIONID 191645

ADD $OSMDATA ./datafile
ADD "http://polygons.openstreetmap.fr/get_poly.py?id=$RELATIONID&params=0" ./shapefile

# osmconvert is able to extract gz files automatically
RUN ./osmconvert -B=shapefile --complete-ways --drop-broken-refs --drop-author --drop-version datafile > data-clipped.osm
RUN ./osmfilter --keep="highway=*" data-clipped.osm > data-clipped-highways.osm

# stage 2: serve OSM file in web application
FROM nginx:alpine
COPY --from=build /tmp/data-clipped-highways.osm /usr/share/nginx/html
COPY / /usr/share/nginx/html
