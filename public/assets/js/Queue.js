class Queue {
    constructor(musicAppInstance) {
        this.musicApp = musicAppInstance;
        this.popup = null,
            this.el = {
                playingElBody: null,
                playingElDefaultQueue: null,
                playingElFavoriteQueue: null,
                playlistActive: null,
                root: document.querySelector('.queuePanel'),
                defaultWrap: document.querySelector('.queueList'),
                favoriteWrap: document.querySelector('.favoriteWrap'),
                playlistWrap: document.querySelector('.playlistWrap')
            };
        this.visibity = false;
        this.playInfo = {
            currQueue: null,
            currIndex: null
        };
        this.list = {
            default: [],
            favorite: [],
            playlist: {}
        }

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

        this.fetchPopup('./PopupJs.js')
            .then(data => {
                let ndConfig = {};
                ndConfig.popup = { el: 'div', cls: 'popup closed' };
                ndConfig.popupLayer = { el: 'div', cls: 'popupLayer' };
                ndConfig.innerPopup = { el: 'div', cls: 'innerPopup' };
                ndConfig.popupHeader = { el: 'div', cls: 'popupHeader' };
                ndConfig.heading = { el: 'div', cls: 'heading', elTxt: "Playlist Popup" };
                ndConfig.closePopup = { el: 'div', cls: 'closePopup material-icons', elTxt: 'highlight_off' };
                ndConfig.popupBody = { el: 'div', cls: 'popupBody' };

                // set config for body section
                ndConfig.newPlaylist = { el: 'div', cls: 'newPlaylist' };
                ndConfig.inputField = { el: 'div', cls: 'inputField' };
                ndConfig.createNewList = { el: 'input', cls: 'createNewList', placeTxt: 'Create new playlist' };
                ndConfig.createNew = { el: 'div', cls: 'createNew material-icons', elTxt: 'create_new_folder' };
                ndConfig.defaultList = { el: 'ul', cls: 'defaultList' };

                let nodes = this.createQueueEl(ndConfig);

                // set popup body section
                nodes.inputField.append(nodes.createNewList, nodes.createNew);
                nodes.newPlaylist.appendChild(nodes.inputField);
                nodes.popupBody.append(nodes.newPlaylist, nodes.defaultList)

                // set header and outer layers
                nodes.popupHeader.append(nodes.heading, nodes.closePopup);
                nodes.innerPopup.append(nodes.popupHeader, nodes.popupBody);
                nodes.popupLayer.appendChild(nodes.innerPopup);
                nodes.popup.appendChild(nodes.popupLayer);

                document.body.prepend(nodes.popup);

                this.playlistPopup = new data.default(nodes.popup, nodes.popupHeader, nodes.defaultList, this);
            });
    }

    popupEventHandler(e) {
        // close popup on blank area and close button
        if (e.target.classList.contains('popup') == true || e.target.classList.contains('closePopup') == true) {
            this.hidden();
        }

        // create playlist
        if (e.target.classList.contains('createNew') == true) {
            let inputEl = e.target.previousElementSibling;
            if (inputEl.tagName.toLowerCase() == 'input') {
                let inputValue = inputEl.value.trim();
                if (inputValue != '') {
                    if (!this.queueReference.list.playlist[inputValue]) {
                        this.queueReference.list.playlist[inputValue] = this.data;
                        this.hidden();
                        let loadSomeTime = () => {
                            let frag = document.createDocumentFragment();

                            let ndConfig = {};
                            ndConfig.li = { el: 'li' };
                            ndConfig.musicIcon = { el: 'span', cls: 'musicIcon material-icons', elTxt: 'queue_music' };
                            ndConfig.text = { el: 'span', cls: 'albumName', elTxt: inputValue };

                            let nodes2 = this.queueReference.createQueueEl(ndConfig);
                            nodes2.li.append(nodes2.musicIcon, nodes2.text);
                            frag.appendChild(nodes2.li);

                            this.body = frag;
                            inputEl.value = '';
                        }
                        // empty input text & add list
                        setTimeout(loadSomeTime, 500);

                        // generate playlist

                        this.queueReference.playlistCreator({ inputValue });
                        console.log(this.queueReference.list.playlist)
                    } else {
                        alert(`Already Exist: "${inputValue}"`);
                    }
                } else {
                    inputEl.parentElement.classList.add('shake');
                    inputEl.parentElement.onanimationend = function () {
                        this.classList.remove('shake');
                    }
                }
            }
        }
    }

    async fetchPopup(url) {
        return await import(url).then(promise => promise).catch(err => console.log);
    }

    popupListGenrate() {
        // ..
    }

    playlistCreator({ inputValue, trackList }) {
        let folderConfig = {
            elTxt: inputValue,
            imgSrc: 'assets/images/no-image-available.jpg',
            dataset: {
                datasetType: 'playlistGrp',
                datasetValue: inputValue
            }
        }
        let parentNode = this.folderHandler(folderConfig);
        let ul = this.createNode({ el: 'ul', cls: 'queueList' });
        let backButtonWrapper = this.createNode({ el: 'div', cls: 'backWrapper' });
        let buttonText = this.createNode({ el: 'div', cls: 'trackName', elTxt: "Go to previous" });
        let backButton = this.createNode({ el: 'div', cls: 'backBtn material-icons', elTxt: 'arrow_back' });

        // add back button in child track list
        backButtonWrapper.append(backButton, buttonText);
        ul.appendChild(backButtonWrapper);

        // create multiple track list
        for (const dir of this.list.playlist[inputValue]) {
            for (const track of dir.tracks) {

                // create node config
                const nodesConfig = {
                    textContent: track.replace(/.mp3$/, ''),
                    imgSrc: `assets/images/no-image-available.jpg`,
                    dataset: {
                        datasetType: 'tracklist',
                        datasetValue: `${dir.directory}/${track}`
                    }
                }
                // get track node and append
                ul.appendChild(this.trackHandler(nodesConfig));
            }
        }

        parentNode.appendChild(ul)
        this.el.playlistWrap.appendChild(parentNode);
        console.log(parentNode);

        let defaultViewNode = this.el.playlistWrap.querySelector('.defaultView');
        if (defaultViewNode != null) {
            defaultViewNode.remove();
        }
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
    queueHandler(config) {
        return this.queueValidation(config)
    }

    queueValidation(config) {
        const isExist = this.isExistInQueue(config);

        if (isExist == true) {
            // this.createMusicListEl(config);
            if (config.queueType == 'default') {
                return 'onlyPlayPause';
            } else {
                return;
            }
        } else {
            return this.addInQueue(config);
        }
    }

    queueValidation001(config, anchor_ele) {
        let isExist;
        if (isExist == false) {
            let musicNodes = [];
            let trackPath;
            let getIndex;  // doneeeeeeeee

            if (config.queueType == 'playlist') {
                let liAncher = this.createQueueNodes(config, anchor_ele, null, 'folderEl');
                let ul = document.createElement('ul');
                liAncher.classList.add('innerTracks');
                liAncher.classList.add('deActive');

                for (const track of config.allTracks) {
                    musicNodes.push(this.createQueueNodes(config, anchor_ele, track));
                    trackPath = anchor_ele.dataset['img'];
                    ul.append(...musicNodes);
                    getIndex = this.playlist.push(trackPath);
                }
                liAncher.appendChild(ul)
                this.el.playlistWrap.appendChild(liAncher);

            } else {
                musicNodes.push(this.createQueueNodes(config, anchor_ele));
                trackPath = anchor_ele.dataset['tracklist'];
            }

            if (config.queueType == 'default') {
                this.el.defaultWrap.appendChild(musicNodes[0]);
                getIndex = this.default.push(trackPath);
            } else if (config.queueType == 'favorite') {
                this.el.favoriteWrap.appendChild(musicNodes[0]);
                getIndex = this.favorite.push(trackPath);
            }

            // usefull for other queues/
            if (config.isPlay == true) { // only play

                // remove playing class previes element and add current element
                if (config.queueType == 'default') {
                    this.playInfo.currQueue = 'default';
                } else if (config.queueType == 'favorite') {
                    this.playInfo.currQueue = 'favorite';
                }

                this.playInfo.currIndex = getIndex - 1;
            } else {
                this.changeActiveState(config, anchor_ele, musicNodes[0].firstChild);
                return; // nothing do any thing
            }
            this.changeActiveState(config, anchor_ele, musicNodes[0].firstChild);
            return 'chnageMusic';
        } else {
            if (config.queueType == 'default') {
                if (anchor_ele.classList.contains('playing') == true) {
                    return 'onlyPlayPause';
                } else {
                    // change music on added queue
                    if (config.isPlay == true) {
                        let mainNode = (anchor_ele.classList.contains('listAnchor') == true) ?
                            anchor_ele :
                            this.musicApp.el.container.querySelector(`a[data-tracklist="${anchor_ele.dataset['tracklist']}"]`);

                        // get playing node into queue
                        let queueNode = (anchor_ele.classList.contains('queueItem') == true) ?
                            anchor_ele :
                            this.el.root.querySelector(`a[data-tracklist="${anchor_ele.dataset['tracklist']}"]`);

                        // remove playing class previes element and add current element
                        this.changeActiveState(config, mainNode, queueNode);
                        return 'chnageMusic'; // change music
                    }
                    // alert("It's already added!")
                }
            } else if (config.queueType == 'favorite') {
                const queueNode = anchor_ele;
                const mainNode = this.musicApp.el.container.querySelector(`a[data-tracklist="${anchor_ele.dataset.tracklist}"]`);
                if (
                    anchor_ele.classList.contains('commDef') != true &&
                    anchor_ele.classList.contains('playing') != true
                ) {
                    this.changeActiveState(config, mainNode, queueNode);
                    return 'chnageMusic';
                } else if (anchor_ele.classList.contains('playing') == true) {
                    return 'onlyPlayPause';
                } else {
                    alert('Already Added');
                    return false; // nothing do any thing
                }
            }
        }
        // }
        // return false;  // nothing do any thing
    }

    // check track exist or not
    isExistInQueue(config) {
        switch (config.queueType) {
            case 'default':
                return this.list.default.includes(config.directory + config.singleTrack);

            case 'favorite':
                return this.list.favorite.includes(config.directory + config.singleTrack);

            case 'playlist':
            // return this.list.playlist.includes(config.directory + config.singleTrack);

            default:
                return false;
        }
    }

    // if is exist queue
    addInQueue(config) {
        console.log(config);
        // handle folders otherwise tracks
        if (config.isFolder == true) {
            this.playlistPopup.data = config.tracks;
            this.playlistPopup.visible();
        } else {
            // create node config
            const nodesConfig = {
                textContent: config.mainEle.querySelector('.gridHead').textContent,
                imgSrc: config.mainEle.querySelector('.blobImg').src,
                dataset: {
                    datasetType: 'tracklist',
                    datasetValue: config.directory + config.singleTrack
                }
            }
            // get track node and append
            let liAncher = this.trackHandler(nodesConfig);

            // handle type
            switch (config.queueType) {
                case 'default':
                    this.el.defaultWrap.appendChild(liAncher);
                    this.list.default.push(config.directory + config.singleTrack);
                    return 'chnageMusic';

                case 'favorite':
                    if (this.el.favoriteWrap.children('defaultView')) {

                    }
                    this.el.defaultWrap.appendChild(liAncher);
                    this.list.favorite.push(config.directory + config.singleTrack);
                    return 'onlyPlayPause';

                default:
                    return;
            }

        }
    }

    // Handle playlist 
    folderHandler({ elTxt, imgSrc, dataset }) {
        // create elements
        // ? All Properties of obj { el, cls, elTxt, src, href, datasetType, datasetValue }
        const li = { el: 'li', cls: 'rowTrack' };
        const a = { el: 'a', cls: 'queueItem', href: 'javascript:void(0)', ...dataset };
        const queueThumb = { el: 'div', cls: 'queueThumb material-icons', ...dataset };
        const img = { el: 'img', cls: 'blobImg', src: imgSrc, ...dataset };
        const trackName = { el: 'div', cls: 'trackName gridHead', elTxt: elTxt, ...dataset };
        const removeBtn = { el: 'div', cls: 'removeBtn material-icons', elTxt: 'close', ...dataset };
        const moreOpt = { el: 'div', cls: 'moreOpt material-icons', elTxt: 'more_vert', ...dataset };
        const backBtn = { el: 'div', cls: 'backBtn material-icons', elTxt: 'arrow_back', ...dataset };

        // create Elements
        const nodes = this.createQueueEl({ li, a, queueThumb, img, trackName, removeBtn, moreOpt, backBtn });

        // append elements
        nodes.queueThumb.append(nodes.img, nodes.backBtn);
        nodes.a.append(nodes.queueThumb, nodes.trackName, nodes.removeBtn, nodes.moreOpt);
        nodes.li.appendChild(nodes.a);
        return nodes.li;
    }

    createNewPlaylist() {
        // for (const folderCollection of config.tracks) {
        //     for (const track of folderCollection.tracks) {
        //         const nodesConfig = {
        //             textContent: track.replace(/[-]|\.mp3/g, ' ').trimEnd(),
        //             imgSrc: 'not-available',
        //             dataset: {
        //                 datasetType: 'tracklist',
        //                 datasetValue: `${folderCollection.directory}/${track}`
        //             }
        //         }
        //         let node = this.trackHandler(nodesConfig);
        //         console.log(node);
        //     }
        // }
    }

    // Handle default and favorite queue
    trackHandler(nodesConfig) {
        // create elements Objects
        // ? All Properties of obj { el, cls, elTxt, src, href, datasetType, datasetValue }
        const li = { el: 'li', cls: 'rowTrack' };
        const a = { el: 'a', cls: 'queueItem', href: 'javascript:void(0)', ...nodesConfig.dataset };
        const queueThumb = { el: 'div', cls: 'queueThumb material-icons', ...nodesConfig.dataset };
        const img = { el: 'img', cls: 'blobImg', src: nodesConfig.imgSrc, ...nodesConfig.dataset };
        const trackName = { el: 'div', cls: 'trackName gridHead', elTxt: nodesConfig.textContent, ...nodesConfig.dataset };
        const removeBtn = { el: 'div', cls: 'removeBtn material-icons', elTxt: 'close', ...nodesConfig.dataset };
        const moreOpt = { el: 'div', cls: 'moreOpt material-icons', elTxt: 'more_vert', ...nodesConfig.dataset };

        // create Elements
        const nodes = this.createQueueEl({ li, a, queueThumb, img, trackName, removeBtn, moreOpt });

        // append elements
        nodes.queueThumb.appendChild(nodes.img);
        nodes.a.append(nodes.queueThumb, nodes.trackName, nodes.removeBtn, nodes.moreOpt);
        nodes.li.appendChild(nodes.a);

        return nodes.li
    }

    // Create main queue ancher nodes
    createQueueEl(nodesObj) {
        let nodes = {};
        // create nodes
        for (const nodeConfig in nodesObj) {
            nodes[nodeConfig] = this.createNode(nodesObj[nodeConfig]);
        }
        return nodes;
    }

    // create element with specific configration
    createNode({
        el = null,
        cls = null,
        elTxt = null,
        src = null,
        href = null,
        datasetType = null,
        datasetValue = null,
        innerHtml = null,
        id = null,
        placeTxt = null
    }) {
        const node = document.createElement(el)

        // add tag in node
        if (cls != null) {
            node.className += cls;
        }

        // add id in node
        if (id != null) {
            node.id += id;
        }

        // add textContent in node
        if (elTxt != null) {
            node.textContent = elTxt;
        }

        // add source file in ancher node
        if (src != null) {
            node.src = src;
        }

        // add href file in ancher node
        if (href != null) {
            node.href = href;
        }

        // add dataSet and value in node
        if (datasetType != null && datasetValue) {
            node.dataset[datasetType] = datasetValue;
        }

        // add dataSet and value in node
        if (datasetType != null && datasetValue) {
            node.dataset[datasetType] = datasetValue;
        }

        // add innerHTML content
        if (innerHtml != null) {
            node.innerHTML = innerHtml;
        }

        // add placeholder text
        if (placeTxt != null) {
            node.placeholder = placeTxt;
        }

        return node;
    }

    // revove to queue
    removeToQueue(e) {
        let wrapperMusicNodes = this.musicApp.get_target_ancher(e.path, 'a');

        // remove on DOM
        let rootMusicEl = wrapperMusicNodes.parentElement;
        rootMusicEl.remove();

        let wrapElement = this.musicApp.get_target_ancher(e.path, '.queueList');
        // remove on queue
        if (wrapElement.classList.contains('defaultWrap') == true) {
            let indexPos = this.default.indexOf(wrapperMusicNode.dataset.tracklist);
            this.default.splice(indexPos, 1);
        } else if (wrapElement.classList.contains('favoriteWrap') == true) {
            let indexPos = this.favorite.indexOf(wrapperMusicNode.dataset.tracklist);
            this.favorite.splice(indexPos, 1);
        }

    }

    // remove active playing class
    changeActiveState(config, mainNode, queueNode) {
        // remove playing class to all placeses
        if (this.el.playingElBody != null) {
            this.el.playingElBody.classList.remove('playing');

            const defaultWrapEl = this.el.defaultWrap.querySelector('.playing');
            const favoriteWrapEl = this.el.favoriteWrap.querySelector('.playing');

            if (defaultWrapEl != null) {
                defaultWrapEl.classList.remove('playing')
            }

            if (favoriteWrapEl != null) {
                favoriteWrapEl.classList.remove('playing')
            }
        }

        // add playing class from all matched content
        const defaultWrapEl = this.el.defaultWrap.querySelector(`a[data-tracklist="${queueNode.dataset.tracklist}"]`);
        const favoriteWrapEl = this.el.favoriteWrap.querySelector(`a[data-tracklist="${queueNode.dataset.tracklist}"]`);

        this.el.playingElBody = mainNode;
        this.el.playingElBody.classList.add('playing');

        if (defaultWrapEl != null) {
            defaultWrapEl.classList.add('playing')
        }

        if (favoriteWrapEl != null) {
            favoriteWrapEl.classList.add('playing')
        }
        // }
    }

    // Create Queue row Wrapper Element
    createQueueNodes(config, anchor_ele, track = null, folderEl = null) {
        let musicPath;
        let heading;
        let onlyDataset = false;
        if (config.queueType == 'playlist' && track != null) {
            musicPath = track;
            heading = track.replace(/.mp3$/, '').replace(/-/g, ' ');
        } else if (folderEl != null) {
            musicPath = anchor_ele.dataset.img;
            heading = anchor_ele.querySelector('.gridHead').textContent;
            onlyDataset = true;
        } else {
            musicPath = anchor_ele.dataset.tracklist;
            heading = anchor_ele.querySelector('.gridHead').textContent;
        }

        // set info in elements
        if (config.queueType == 'default') {
            a.classList.add('commDef');
        }


        // append all Elements
        queueThumb.appendChild(img);

        // backBtn for playlist 
        if (folderEl != null) {
            queueThumb.appendChild(backBtn);
        }

        a.append(queueThumb, trackName, removeBtn, moreOpt)
        li.appendChild(a);
        return li;
    }

    // Add to favorite Queue
    toggleToFav(e, type) {
        switch (type) {
            case 'favorite':
                this.el.root.classList.toggle('favoriteActive');
                this.el.root.classList.remove('playlistActive');
                break;

            case 'playlist':
                this.el.root.classList.toggle('playlistActive');
                this.el.root.classList.remove('favoriteActive');
                break;

            default:
                break;
        }
    }

    addToFavQueue(e) {
        let defaultViewNode = this.el.favoriteWrap.querySelector('.defaultView');
        if (defaultViewNode != null) {
            defaultViewNode.remove();
        }
        let mainEl = this.musicApp.get_target_ancher(e.path, 'a');
        const directory = ('img' in mainEl.dataset) ? mainEl.dataset.img : mainEl.dataset.tracklist;
        const config = {
            mainEle: mainEl,
            directory: directory,
            isPlay: false,
            queueType: 'favorite'
        }
        this.addToQueue(config);
    }

    setConfigQueue(e, config) {
        let mainEl = this.musicApp.get_target_ancher(e.path, 'a');
        const isFolder = mainEl.dataset.img == undefined ? false : true;

        // Add or modify configration setting
        config.mainEle = mainEl;
        config.isPlay = config.isPlay || false;
        config.isFolder = isFolder;

        // check folder or not
        if (isFolder == false) {
            let regex = mainEl.dataset.tracklist.match(/(.*\/)(\b[-\w]+.mp3)$/);
            config.directory = regex[1]
            config.singleTrack = regex[2];
        } else {
            const tracks = this.getMusicTracks(mainEl);
            config.tracks = tracks;
            config.directory = ('img' in mainEl.dataset) ? mainEl.dataset.img : mainEl.dataset.tracklist;
        }

        // add to queue
        return this.queueHandler(config);
    }

    getMusicTracks(anchor_ele) {
        const testData = anchor_ele.dataset.img.split('/');
        const data = this.musicApp.musicAppViewInstance.musicDir;
        const cloneData = JSON.parse(JSON.stringify(data));

        // get current position array of object
        function findDir(data, testData) {
            if (testData.length == 0) {
                return data;
            }
            let element = testData[0];

            if (data.length != 0) {
                let firstEle = data.shift();
                if (firstEle.name == element) {
                    testData.shift()
                    return findDir(firstEle.children, testData);
                }
                return findDir(data, testData);
            }
        }

        // get all tracks
        function tracks(data, result = []) {
            if (data.length == 0) {
                return result;
            }
            const lastVal = data.pop();

            if (lastVal.type == 'folder') {
                data.push(...lastVal.children);
            }

            if (lastVal.type == 'track') {
                let obj = {
                    directory: lastVal.path,
                    tracks: [...lastVal.tracks]
                };
                result.push(obj);
            }

            return tracks(data, result);
        }

        let currDir = findDir(cloneData, testData);
        let res = tracks(JSON.parse(JSON.stringify(currDir)));
        return res
    }

    toggleInnerPlaylist(e) {
        // add active class
        let current = this.musicApp.get_target_ancher(e.path, 'a').parentElement;
        let nextSibling = current.nextElementSibling;
        let prevSibling = current.previousElementSibling;

        while (nextSibling) {
            nextSibling.classList.remove('activeList');
            nextSibling = nextSibling.nextElementSibling;
        }
        while (prevSibling) {
            prevSibling.classList.remove('activeList');
            prevSibling = prevSibling.prevSibling;
        }

        current.classList.toggle('activeList');
        if (current.classList.contains('activeList') == true) {
            current.parentElement.classList.add('containActive');
        } else {
            current.parentElement.classList.remove('containActive');
        }
        

        // add back button 
        // let imgTag = aTag.querySelector('.queueThumb');
        // imgTag.removeAttribute('data-playlist-grp');
        // imgTag.innerHTML = '';
        // imgTag.appendChild(backBtn);


    }
}
export default Queue;