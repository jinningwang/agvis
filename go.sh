#!/usr/bin/env bash

tag=agvis:$USER
name=agvis_$USER
target=base
data=/Users/hcui7/tmp
registry=ltb.curent.utk.edu:5000
xauth=
entrypoint=
ipc=
net=host
user=1
cwd=1
interactive=1
script=
port=8810
pipindex=
piptrustedhost=

[ -f env.sh ] && . env.sh

build() {
    # Clone ANDES and DiME if they don't exist
    if [ ! -d "../andes" ]; then
        echo "Cloning ANDES repository..."
        git clone https://github.com/cuihantao/andes.git ../andes
    fi
    if [ ! -d "../dime" ]; then
        echo "Cloning DiME repository..."
        git clone https://github.com/CURENT/dime.git ../dime
    fi

    # Copy ANDES and DiME to build directory
    echo "Copying ANDES and DiME to build directory..."
    cp -af ../andes .
    cp -af ../dime .

    # Build the Docker image
    echo "Building Docker image $tag..."
    docker build \
        ${target:+--target $target} \
        ${pipindex:+--build-arg PIP_INDEX_URL=$pipindex} \
        ${piptrustedhost:+--build-arg PIP_TRUSTED_HOST=$piptrustedhost} \
        -t $tag .
}

dev2() {
    google-chrome --incognito http://localhost:8810/ 2> /dev/null > /dev/null &!
    
    tmux split-window -v
    tmux split-window -v
    tmux select-layout tiled
    tmux send-keys -t0 "docker run -u root --rm -t -v /tmp:/tmp -v `pwd`/agvis/static:/srv -p 8810:8810 $tag agvis run --static /srv --port $((port+0))" Enter
    tmux send-keys -t1 "docker run --rm -t -v /tmp:/tmp -p 8818:8818 $tag dime -vv -l unix:/tmp/dime2 -l ws:$((port+8))" Enter
    tmux send-keys -t2 "docker run -u root --rm -t -v /tmp:/tmp -v `pwd`/agvis/cases:/home/cui/work $tag andes run wecc.xlsx -r tds --dime-address ipc:///tmp/dime2"
}

clean() {
    echo "Cleaning ANDES output file..."
    andes misc -C --recursive

    echo "Stopping and removing all Docker containers and images..."
    if [ -n "$(docker ps -aq)" ]; then
        docker stop $(docker ps -aq)
    fi
    if [ -n "$(docker ps -q)" ]; then
        docker kill $(docker ps -q)
    fi
    if [ -n "$(docker images -a -q)" ]; then
        docker rmi $(docker images -a -q)
    fi

    echo "Stopping all tmux sessions..."
    tmux kill-server

    echo "Removing DiME Unix domain sockets..."
    if [ -e "/tmp/dime" ]; then
        rm /tmp/dime
    fi
    if [ -e "/tmp/dime2" ]; then
        rm /tmp/dime2
    fi

    echo "Cleaning completed."
}

run() {
    if [ -n "$xauth" ]; then
        rm -f $xauth
        xauth nlist $DISPLAY | sed -e 's/^..../ffff/' | xauth -f $xauth nmerge -
    fi
    
    docker run --rm \
    ${interactive:+-it} \
    ${script:+-a stdin -a stdout -a stderr --sig-proxy=true} \
    ${ipc:+--ipc=$ipc} \
    ${net:+--net=$net} \
    ${user:+-u $(id -u):$(id -g)} \
    ${cwd:+-v $PWD:$PWD -w $PWD} \
    ${port:+-p $port:$port} \
    ${port2:+-p $port2:$port2} \
    ${data:+-v $data:$data} \
    ${xauth:+-e DISPLAY -v /etc/group:/etc/group:ro -v /etc/passwd:/etc/passwd:ro -v /etc/shadow:/etc/shadow:ro -v /etc/sudoers.d:/etc/sudoers.d:ro -v $xauth:$xauth -e XAUTHORITY=$xauth} \
    ${entrypoint:+--entrypoint $entrypoint} \
    $tag "$@"
}

run_8810() {
    port=8810
    net=
    run "$@"
}
run_8811() {
    port=8811
    net=host
    run "$@"
}
run_8812() {
    port=8812
    net=host
    run "$@"
}
run_8819() {
    port=8819
    port2=8818
    net=
    run "$@"
}

inspect() {
    entrypoint='/bin/bash -i' run "$@"
}

script() {
    interactive= script=1 run "$@"
}

push() {
    docker tag $tag $registry/$tag
    docker push $registry/$tag
}

create() {
    docker service create \
    ${name:+--name $name} \
    ${cwd:+--mount type=bind,src=$PWD,dst=$PWD} \
    ${data:+--mount type=bind,src=$data,dst=$data} \
    $registry/$tag \
    "$@"
}

destroy() {
    docker service rm $name
}

logs() {
    docker service logs $name "$@"
}

python() { python3 "$@"; }
python3() { run python3 -u "$@"; }
server() { python3 server.py --port=$port "$@"; }
andes() { run andes "$@"; }
reader() {
    python benchmark.py --dime tcp://127.0.0.1:$port,reader,writer "$@" reader
}
writer() {
    python benchmark.py --dime tcp://127.0.0.1:$port,writer,reader "$@" writer
}
dime() {
    run dime ${1:-tcp://0.0.0.0:8819} --debug
}

dev-benchmark() {
    tmux split-window -v
    tmux split-window -v
    tmux send-keys -t0 "#./go.sh dime" Enter
    tmux send-keys -t1 "#./go.sh reader" Enter
    tmux send-keys -t2 "#./go.sh writer" Enter
}

dev() {
    google-chrome --incognito http://localhost:8810/ 2> /dev/null > /dev/null &!
    
    tmux split-window -v
    tmux split-window -v
    tmux select-layout tiled
    tmux send-keys -t0 "docker run --rm -t -v `pwd`/static:/srv -p 8810:8810 $tag python3 -m http.server -d /srv $((port+0))" Enter
    tmux send-keys -t1 "docker run --rm -t -v /tmp:/tmp -p 8818:8818 $tag dime -vv -l unix:/tmp/dime2 -l ws:$((port+8))" Enter
    tmux send-keys -t2 "docker run --rm -t -v /tmp:/tmp -v `pwd`/cases:/home/cui/work $tag andes -v 10 run wecc_vis.xlsx -r tds"
}

dev-cygwin() {
    google-chrome --incognito http://localhost:8810/ 2> /dev/null > /dev/null &!
    
    mintty --exec "docker run --rm -t -v C:/cygwin64/`pwd`/static:/srv -p 8810:8810 $tag python3 -m http.server -d /srv $((port+0))" &!
    mintty --exec "docker run --rm -t -p 5000:5000 -p 8818:8818 $tag dime -vv -l tcp:5000 -l ws:$((port+8))" &!
    #mintty --exec "docker run --rm -t $tag andes -v 10 run /home/cui/wecc_vis.xlsx --dime tcp://127.0.0.1:5000 -r tds" &!
}

dime-cygwin() {
    docker run --rm -it -p 5000:5000 -p 8818:8818 $tag dime -vv -l tcp:5000 -l ws:$((port+8))
}

http-cygwin() {
    docker run --rm -it -v C:/cygwin64/`pwd`/static:/srv -p 8810:8810 $tag python3 -m http.server -d /srv $((port+0))
}

"$@"
