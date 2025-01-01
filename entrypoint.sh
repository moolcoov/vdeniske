#!/bin/bash

# running migrations
echo $POSTGRES_URL
dbmate --url "$POSTGRES_URL?sslmode=disable" up

mkdir -p /storage/attachments
mkdir -p /storage/avatars

/app/vdeniske
