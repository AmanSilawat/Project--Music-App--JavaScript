class Queue {
    constructor(musicAppInstance) {
        this.musicApp = musicAppInstance;
        this.el = {
            mainActive: null,
            defaultActive: null,
            favoriteActive: null,
            playlistActive: null,
            root: document.querySelector('.queuePanel'),
            queueList: document.querySelector('.queueList'),
            favWrap: document.querySelector('.favWrap')
        };
        this.visibity = false;
        this.playInfo = {
            currQueue: null,
            currIndex: null
        };
        this.default = [];
        this.favorite = [];
        this.playlist = [];

        // initialization
        this.init();
    }

    init() {
        // Listen Events
        this.eventListener();

        // queue.js is completely loaded then work this
        let drawOtherQueues = new Promise((resolve) => {
            resolve();
        });
    }

    // Listen Event's
    eventListener() {
        // Mouse Over on Queue bar
        this.el.root.addEventListener('mouseenter', (event) => this.toggleQueueBar(event, 'focus_in'));
        this.el.root.addEventListener('mouseleave', (event) => this.toggleQueueBar(event, 'focus_out'));

        // 
    }

    // Toggle Sidebar Queue 
    toggleQueueBar(e, focus_type) {
        switch (focus_type) {
            case 'focus_in':
                this.el.root.classList.remove('shortView')
                break;

            case 'focus_out':
                this.el.root.classList.add('shortView')
                break;

            default:
                break;
        }
    }

    // add to queue
    addToQueue(config) {
        const anchor_ele = this.musicApp.get_target_ancher(config.event.path, 'a');

        console.log(config.queueType);
        switch (config.queueType) {
            case 'default':
                return this.defaultQueue(config, anchor_ele);
                break;

            case 'favorite':
                return this.favoriteQueue(config, anchor_ele);
                break;

            default:
                break;
        }

    }

    defaultQueue(config, anchor_ele) {
        if ('tracklist' in anchor_ele.dataset) {
            // already exeist in playlist then return false otherwise return node
            let isMusicNode = this.queue_track(config, anchor_ele);

            if (isMusicNode !== false) {
                this.el.queueList.appendChild(isMusicNode); // default

                // remove playing class previes element and add current element
                if (config.appendNPlay == true) {
                    this.changeActiveState(anchor_ele, isMusicNode.firstChild);
                }

                const trackPath = anchor_ele.dataset['tracklist'];
                const getIndex = this.default.push(trackPath);

                this.playInfo.currQueue = 'default';
                this.playInfo.currIndex = getIndex - 1;

                return 'chnageMusic';
            } else {
                if (anchor_ele.classList.contains('playing') == true) {
                    return 'onlyPlayPause';
                }
            }
        }

        if (config.appendNPlay != true) {
            alert("It's already added!")
        } else {
            let mainNode = (anchor_ele.classList.contains('listAnchor') == true) ?
                anchor_ele :
                this.musicApp.el.container.querySelector(`a[data-tracklist="${anchor_ele.dataset['tracklist']}"]`);

            // get playing node into queue
            let queueNode = (anchor_ele.classList.contains('queueItem') == true) ?
                anchor_ele :
                this.el.root.querySelector(`a[data-tracklist="${anchor_ele.dataset['tracklist']}"]`);

            // remove playing class previes element and add current element
            this.changeActiveState(mainNode, queueNode);
            return 'chnageMusic'; // change music
        }
    }
    favoriteQueue(config, anchor_ele) {
        if ('tracklist' in anchor_ele.dataset) {
            // already exeist in playlist then return false otherwise return node
            console.log(this);
            console.log();
            if (this.favorite.includes(anchor_ele.dataset.tracklist) != true) {
                let isMusicNode = this.queue_track(config, anchor_ele);

                this.el.favWrap.appendChild(isMusicNode); // diff

                const trackPath = anchor_ele.dataset['tracklist'];
                const getIndex = this.favorite.push(trackPath); // diff

                
                if (config.appendNPlay == true) {
                    console.log('config.appendNPlay');
                    this.changeActiveState(anchor_ele, isMusicNode.firstChild);

                    // remove playing class previes element and add current element
                    this.playInfo.currQueue = 'favorite'; // diff
                    this.playInfo.currIndex = getIndex - 1;
                }

                return 'chnageMusic';
            } else {
                if (anchor_ele.classList.contains('playing') == true) {
                    return 'onlyPlayPause';
                }
            }
        }

        if (config.appendNPlay != true) {
            alert("It's already added!")
        } else {
            let mainNode = (anchor_ele.classList.contains('listAnchor') == true) ?
                anchor_ele :
                this.musicApp.el.container.querySelector(`a[data-tracklist="${anchor_ele.dataset['tracklist']}"]`);

            // get playing node into queue
            let queueNode = (anchor_ele.classList.contains('queueItem') == true) ?
                anchor_ele :
                this.el.root.querySelector(`a[data-tracklist="${anchor_ele.dataset['tracklist']}"]`);

            // remove playing class previes element and add current element
            this.changeActiveState(mainNode, queueNode);
            return 'chnageMusic'; // change music
        }
    }

    // revove to queue
    removeToQueue(e) {
        console.log(e.target);
        let wrapperMusicNode = this.musicApp.get_target_ancher(e.path, 'a');

        // remove on DOM
        let rootMusicEl = wrapperMusicNode.parentElement;
        rootMusicEl.remove();

        // remove on queue
        if (e.target.classList.contains('default') == true) {
            let indexPos = this.default.indexOf(wrapperMusicNode.dataset.tracklist);
            this.default.splice(indexPos, 1);
        } else if (e.target.classList.contains('favorite') == true) {
            let indexPos = this.favorite.indexOf(wrapperMusicNode.dataset.tracklist);
            this.favorite.splice(indexPos, 1);
        }
    }

    // remove active playing class
    changeActiveState(mainNode, queueNode) {
        // remove playing class previes element
        if (this.el.mainActive != null) {
            this.el.mainActive.classList.remove('playing');
            this.el.defaultActive.classList.remove('playing');
        }
        // add playing Element in queue
        this.el.mainActive = mainNode;
        this.el.defaultActive = queueNode;

        // add playing class in active   queue
        this.el.mainActive.classList.add('playing');
        this.el.defaultActive.classList.add('playing');
    }

    // Create Queue row Wrapper Element
    queue_track(config, anchor_ele) {
        let musicPath = anchor_ele.dataset.tracklist;
        // create elements
        const li = document.createElement('li');
        const a = document.createElement('a');
        const queueThumb = document.createElement('div');
        const img = document.createElement('img');
        const trackName = document.createElement('div');
        const removeBtn = document.createElement('div');
        const moreOpt = document.createElement('div');

        // set info in elements
        li.className += 'rowTrack';
        a.className += 'queueItem';
        a.href = 'javascript:void(0)';
        queueThumb.className += 'queueThumb material-icons';
        trackName.className += 'trackName gridHead';
        removeBtn.className += 'removeBtn material-icons';

        if ( config.queueType == 'default') {
            removeBtn.classList.add(config.queueType);
        } else if ( config.queueType == 'favorite') {
            removeBtn.classList.add(config.queueType);
        }

        img.className += 'blobImg';
        moreOpt.className += 'moreOpt material-icons';
        removeBtn.textContent = 'close';
        moreOpt.textContent = 'more_vert';

        // set dataset hasAttribute
        a.dataset.tracklist = musicPath;
        queueThumb.dataset.tracklist = musicPath;
        img.dataset.tracklist = musicPath;
        trackName.dataset.tracklist = musicPath;

        img.src = anchor_ele.querySelector('.blobImg').src;
        trackName.textContent = anchor_ele.querySelector('.gridHead').textContent;

        // append all Elements
        queueThumb.appendChild(img);
        a.append(queueThumb, trackName, removeBtn, moreOpt)
        li.appendChild(a);
        return li;
    }

    // Add to favorite Queue
    toggleToFav(e) {
        this.el.root.classList.toggle('favoriteActive');
    }

    addToFavQueue(e) {
        let defaultViewNode = this.el.favWrap.querySelector('.defaultView')
        if (defaultViewNode != null) {
            defaultViewNode.remove();
        }
        const config = {
            event: e,
            appendNPlay: false,
            queueType: 'favorite'
        }
        this.addToQueue(config);
    }
}
export default Queue;