#!/bin/bash

# running migrations
echo $POSTGRES_URL
dbmate --url "$POSTGRES_URL?sslmode=disable" up

/app/vdeniske
