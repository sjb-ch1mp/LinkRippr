function getDomain(url){
    if(!(url.startsWith('http')) || !(url.contains('//')) || !(url.contains('.'))){
        return null;
    }

    if(url.split('//')[1].length < 4){ //i.e. one letter + full stop + two letter tld
        return null;
    }

    url = url.split('//')[1];
    let i = url.indexOf('.');
    while(i < url.length && /[a-zA-Z0-9\.\-]/.matches(url.charAt(i))){
        i++;
    }

    return url.substring(0, i);
}

function sharesTldWithAlexaDomain(domain){
    let alexaTop1000 = getAlexaTop1000();
    let domAry = domain.split(".");
    let match = true;
    for(let i in alexaTop1000){
        let alexaAry = alexaTop1000[i].split(".");
        let lrgAry = (alexaAry.length > domAry.length) ? alexaAry : domAry;
        let smlAry = (alexaAry.length < domAry.length) ? alexaAry : ((alexaAry.length === domAry.length) ? alexaAry : domAry);
        let j = 1;
        while(smlAry.length - j >= 0){
            match = smlAry[smlAry.length - j] === lrgAry[lrgAry.length - j];
            j++;
        }
    }
    return match;
}


function inAlexaTop1000(url){ //FIXME : Add this function to LinkRippr

    let domain = getDomain(url);
    if(domain == null){
        return;
    }

    return getAlexaTop1000().contains(domain) || sharesTldWithAlexaDomain(domain);
}

function getAlexaTop1000(){
    return [
        'google.com',
        'youtube.com',
        'tmall.com',
        'qq.com',
        'baidu.com',
        'facebook.com',
        'sohu.com',
        'login.tmall.com',
        'taobao.com',
        'yahoo.com',
        '360.cn',
        'wikipedia.org',
        'jd.com',
        'amazon.com',
        'pages.tmall.com',
        'weibo.com',
        'zoom.us',
        'sina.com.cn',
        'live.com',
        'reddit.com',
        'netflix.com',
        'vk.com',
        'okezone.com',
        'office.com',
        'microsoft.com',
        'xinhuanet.com',
        'csdn.net',
        'instagram.com',
        'alipay.com',
        'blogspot.com',
        'yahoo.co.jp',
        'microsoftonline.com',
        'bongacams.com',
        'myshopify.com',
        'babytree.com',
        'stackoverflow.com',
        'google.com.hk',
        'panda.tv',
        'twitch.tv',
        'aliexpress.com',
        'bing.com',
        'naver.com',
        'livejasmin.com',
        'zhanqi.tv',
        'ebay.com',
        'tribunnews.com',
        'tianya.cn',
        'chaturbate.com',
        'amazon.co.jp',
        'google.co.in',
        'china.com.cn',
        'apple.com',
        'adobe.com',
        'twitter.com',
        'amazon.in',
        'mail.ru',
        'linkedin.com',
        'sogou.com',
        'wordpress.com',
        'msn.com',
        'pornhub.com',
        'yandex.ru',
        'dropbox.com',
        'ok.ru',
        'google.co.jp',
        'aparat.com',
        'yy.com',
        'huanqiu.com',
        'medium.com',
        'trello.com',
        'imdb.com',
        'google.com.br',
        'imgur.com',
        'detail.tmall.com',
        'amazonaws.com',
        '17ok.com',
        'alibaba.com',
        'grid.id',
        'detik.com',
        'whatsapp.com',
        'spotify.com',
        'bbc.com',
        'amazon.de',
        'google.cn',
        'udemy.com',
        'github.com',
        'fandom.com',
        'worldometers.info',
        'cnn.com',
        '1688.com',
        'xvideos.com',
        'nytimes.com',
        'bilibili.com',
        'ettoday.net',
        'mama.cn',
        'paypal.com',
        'google.de',
        'amazon.co.uk',
        'google.fr',
        'roblox.com',
        'pixnet.net',
        'google.ru',
        'instructure.com',
        'kompas.com',
        'indeed.com',
        'rakuten.co.jp',
        'soundcloud.com',
        'etsy.com',
        'sindonews.com',
        'jrj.com.cn',
        'yao.tmall.com',
        'padlet.com',
        'flipkart.com',
        'stackexchange.com',
        'google.it',
        'google.es',
        'indiatimes.com',
        'tumblr.com',
        'office365.com',
        'globo.com',
        'cnblogs.com',
        'bbc.co.uk',
        'canva.com',
        'hao123.com',
        'theguardian.com',
        'uol.com.br',
        'nih.gov',
        'mercadolivre.com.br',
        'thestartmagazine.com',
        'shutterstock.com',
        'pinterest.com',
        'xhamster.com',
        'zhihu.com',
        '163.com',
        'google.com.tw',
        'soso.com',
        'youm7.com',
        'wetransfer.com',
        'digikala.com',
        'onlinesbi.com',
        'savefrom.net',
        'tradingview.com',
        'google.com.mx',
        'pixabay.com',
        'google.com.sg',
        'daum.net',
        'so.com',
        'vimeo.com',
        'slideshare.net',
        'liputan6.com',
        'google.com.tr',
        'salesforce.com',
        'gosuslugi.ru',
        'booking.com',
        'iqoption.com',
        'grammarly.com',
        'google.co.uk',
        'tokopedia.com',
        'researchgate.net',
        'zillow.com',
        'cnet.com',
        'craigslist.org',
        'gome.com.cn',
        'okta.com',
        'chase.com',
        'rednet.cn',
        'wix.com',
        'archive.org',
        'speedtest.net',
        'walmart.com',
        'brilio.net',
        'avito.ru',
        'mediafire.com',
        'tiktok.com',
        'suara.com',
        'amazon.ca',
        'pexels.com',
        '6.cn',
        'aliyun.com',
        'espn.com',
        'google.com.eg',
        'wikihow.com',
        'godaddy.com',
        'washingtonpost.com',
        'investing.com',
        '3c.tmall.com',
        'bukalapak.com',
        'forbes.com',
        'healthline.com',
        'coursera.org',
        'ups.com',
        'usps.com',
        'manoramaonline.com',
        'ladbible.com',
        'force.com',
        'ilovepdf.com',
        'duckduckgo.com',
        'skype.com',
        'homedepot.com',
        'subject.tmall.com',
        'nicovideo.jp',
        'w3schools.com',
        'gamepedia.com',
        'bestbuy.com',
        'merdeka.com',
        'webex.com',
        'ebc.net.tw',
        'google.ca',
        'primevideo.com',
        'ltn.com.tw',
        'ebay.de',
        'ikea.com',
        'iqiyi.com',
        'uniqlo.tmall.com',
        'tistory.com',
        'ask.com',
        'setn.com',
        'google.com.ar',
        'chouftv.ma',
        'google.com.sa',
        'namnak.com',
        'discord.com',
        'blogger.com',
        'momoshop.com.tw',
        'shaparak.ir',
        'smallpdf.com',
        'telegram.org',
        'fedex.com',
        'dostor.org',
        'y2mate.com',
        'taboola.com',
        'itnuzleafan.com',
        'xnxx.com',
        'businessinsider.com',
        't.co',
        'hdfcbank.com',
        'quora.com',
        'heavy.com',
        'lazada.sg',
        'bet9ja.com',
        'eastday.com',
        'jianshu.com',
        'freepik.com',
        'behance.net',
        'newstrend.news',
        'nike.com',
        'messenger.com',
        'patch.com',
        'idntimes.com',
        'zerodha.com',
        'protothema.gr',
        'otvfoco.com.br',
        'google.co.th',
        'nianhuo.tmall.com',
        'nvzhuang.tmall.com',
        'redd.it',
        'metropoles.com',
        'hespress.com',
        'evernote.com',
        'ameblo.jp',
        'hulu.com',
        'dailymotion.com',
        'op.gg',
        'ca.gov',
        'ofgogoatan.com',
        'list.tmall.com',
        'cnbc.com',
        'get-express-vpn.com',
        'mozilla.org',
        'aliexpress.ru',
        'patria.org.ve',
        'amazon.es',
        'kumparan.com',
        'googlevideo.com',
        'telewebion.com',
        'food.tmall.com',
        'google.co.id',
        'reverso.net',
        'abs-cbn.com',
        'google.pl',
        'amazon.it',
        'thesaurus.com',
        'target.com',
        'deepl.com',
        'steamcommunity.com',
        'sciencedirect.com',
        'weebly.com',
        'gmw.cn',
        'foxnews.com',
        'mercadolibre.com.mx',
        'mercadolibre.com.ar',
        'box.com',
        '51.la',
        'aimer.tmall.com',
        'epicgames.com',
        'line.me',
        'trustpilot.com',
        'weather.com',
        'mathrubhumi.com',
        'dailymail.co.uk',
        'itpatratr.com',
        't.me',
        'icicibank.com',
        'jpnn.com',
        'hoodsite.com',
        'thepiratebay.org',
        'scribd.com',
        'breitbart.com',
        '51sole.com',
        'wayfair.com',
        'etheplatinum.com',
        'aminoapps.com',
        'amazon.fr',
        'goodreads.com',
        'gap.tmall.com',
        'moneycontrol.com',
        'samsung.com',
        'mercari.com',
        'amazon.cn',
        'cloudfront.net',
        'asos.com',
        'allegro.pl',
        'geeksforgeeks.org',
        'loom.com',
        'elbalad.news',
        'ebay-kleinanzeigen.de',
        'academia.edu',
        'z3dmbpl6309s.com',
        'fc2.com',
        'albawabhnews.com',
        'wikimedia.org',
        'hotstar.com',
        'miao.tmall.com',
        'myhome.tmall.com',
        'investopedia.com',
        'amazon.com.mx',
        'ikco.ir',
        'wixsite.com',
        'agah.com',
        'softonic.com',
        'err.tmall.com',
        'hootsuite.com',
        'quizlet.com',
        'pinimg.com',
        'binance.com',
        'google.co.kr',
        'sberbank.ru',
        'yts.mx',
        'cambridge.org',
        'sbc7wfnaakau.com',
        'note.com',
        'fiaharam.net',
        'fiverr.com',
        'bbcollab.com',
        'ebay.co.uk',
        'indiamart.com',
        'bbom2b434493.com',
        'qoo10.sg',
        'trendyol.com',
        'wildberries.ru',
        'norton.com',
        'google.com.au',
        '9gag.com',
        'kinopoisk.ru',
        'google.gr',
        'airbnb.com',
        'tsetmc.com',
        'kakao.com',
        'spao.tmall.com',
        'slack.com',
        'wordreference.com',
        'chess.com',
        'wsj.com',
        'gstatic.com',
        'blackboard.com',
        'hepsiburada.com',
        'divar.ir',
        'wowhead.com',
        'rambler.ru',
        'dell.com',
        '1337x.to',
        'chinaz.com',
        'cnnic.cn',
        'caixa.gov.br',
        'emofid.com',
        'crabsecret.tmall.com',
        'steampowered.com',
        'zendesk.com',
        'google.com.ua',
        'aol.com',
        'in.gr',
        'au79nt5wic4x.com',
        'hp.com',
        'who.int',
        'smallseotools.com',
        'souq.com',
        'borna.news',
        'beytoote.com',
        'marketwatch.com',
        'tahiamasr.com',
        'n11.com',
        'sportbible.com',
        'namu.wiki',
        'eksisozluk.com',
        'inquirer.net',
        'squarespace.com',
        'gmx.net',
        'ensonhaber.com',
        'rt.com',
        'patreon.com',
        'ouedkniss.com',
        'google.com.vn',
        'mit.edu',
        'alwafd.news',
        'amazon.com.br',
        'duolingo.com',
        'edmodo.com',
        '104.com.tw',
        'prothomalo.com',
        'kakaku.com',
        'hurriyet.com.tr',
        'list-manage.com',
        'lee.tmall.com',
        'getbootstrap.com',
        'shopee.tw',
        'huaban.com',
        'hindustantimes.com',
        'fast.com',
        'dcard.tw',
        'bp.blogspot.com',
        'gismeteo.ru',
        '17track.net',
        'ecosia.org',
        'irs.gov',
        'deviantart.com',
        'mofidonline.com',
        'zippyshare.com',
        'bet365.com',
        'google.ro',
        'dbs.com.sg',
        'zoho.com',
        'varzesh3.com',
        'intoday.in',
        'azure.com',
        'uptodown.com',
        'xfinity.com',
        'properatersch.fun',
        'dmm.co.jp',
        'bankofamerica.com',
        'surveymonkey.com',
        'haofang.net',
        'dyson.tmall.com',
        'playstation.com',
        'nikkei.com',
        'wish.com',
        'youporn.com',
        'naukri.com',
        'orange.fr',
        'lowes.com',
        'techcrunch.com',
        'coupang.com',
        'cdc.gov',
        'douban.com',
        'doubleclick.net',
        'disneyplus.com',
        'gotowebinar.com',
        'google.co.ve',
        'twimg.com',
        '81.cn',
        'gmanetwork.com',
        'ebay.com.au',
        'webmd.com',
        'td.com',
        'sabq.org',
        'gotomeeting.com',
        'shopee.co.id',
        'banvenez.com',
        'sourceforge.net',
        'wondershare.com',
        'khanacademy.org',
        'tutorialspoint.com',
        'tencent.com',
        'mi.com',
        'neiyi.tmall.com',
        'glassdoor.com',
        'genius.com',
        'efu.com.cn',
        'arcgis.com',
        'uselnk.com',
        'springer.com',
        'canada.ca',
        'realtor.com',
        'kapanlagi.com',
        'issuu.com',
        'ecsw.ir',
        'news18.com',
        'namasha.com',
        'sonhoo.com',
        'ameritrade.com',
        'weblio.jp',
        'cdstm.cn',
        'filimo.com',
        'spankbang.com',
        '312168.com',
        'elpais.com',
        'wellsfargo.com',
        'wordpress.org',
        'indianexpress.com',
        'wattpad.com',
        'alodokter.com',
        'mgid.com',
        'buzzfeed.com',
        'oracle.com',
        'leboncoin.fr',
        '58.com',
        'infobae.com',
        'bhphotovideo.com',
        'reclameaqui.com.br',
        'douyu.com',
        'crunchyroll.com',
        'gfycat.com',
        'outbrain.com',
        'livejournal.com',
        'istockphoto.com',
        'justdial.com',
        'wowkeren.com',
        'biobiochile.cl',
        'gsmarena.com',
        'files.wordpress.com',
        'minecraft.net',
        'youdao.com',
        'costco.com',
        'udn.com',
        'hatenablog.com',
        'hm.com',
        'vnexpress.net',
        'cnnindonesia.com',
        'adp.com',
        'lining.tmall.com',
        'shimo.im',
        'uchi.ru',
        'herokuapp.com',
        'hollisterco.tmall.com',
        'wp.pl',
        'rediff.com',
        'google.cl',
        'discordapp.com',
        'usatoday.com',
        'redbubble.com',
        'onet.pl',
        'dnevnik.ru',
        'google.dz',
        'spanishdict.com',
        'emol.com',
        'lifo.gr',
        'lun.com',
        'slickdeals.net',
        'memurlar.net',
        'giphy.com',
        'macys.com',
        'att.com',
        'npr.org',
        'schoology.com',
        'web.de',
        'google.com.pe',
        'olx.pl',
        'lenta.ru',
        'ria.ru',
        'tandfonline.com',
        'kickstarter.com',
        'shopify.com',
        '360.com',
        'ninisite.com',
        'medicalnewstoday.com',
        'techradar.com',
        'dhl.com',
        'segmentfault.com',
        'libero.it',
        'cnbcindonesia.com',
        'bankmellat.ir',
        'lachapelle.tmall.com',
        'ivi.ru',
        'seznam.cz',
        'ytmp3.cc',
        'wegotthiscovered.com',
        'shopee.com.my',
        'theverge.com',
        'google.com.co',
        'toutiao.com',
        'gamespot.com',
        'tejaratnews.com',
        'trendingnow.video',
        'docusign.net',
        'google.az',
        'impress.co.jp',
        'digitaltrends.com',
        'gusuwang.com',
        'donya-e-eqtesad.com',
        'intuit.com',
        'protagonista.com.co',
        'wiley.com',
        'popads.net',
        'mseav.com',
        'consultant.ru',
        'liansuo.com',
        'chinadaily.com.cn',
        'discoveryexpedition.tmall.com',
        'pngtree.com',
        'ultimate-guitar.com',
        'schwab.com',
        'mileroticos.com',
        'qiannaimei.tmall.com',
        'tripadvisor.com',
        'ign.com',
        'goo.ne.jp',
        'elsevier.com',
        'atlassian.net',
        'sahibinden.com',
        'ih5.cn',
        'editor.wix.com',
        'septwolves.tmall.com',
        'watch.tmall.com',
        'britannica.com',
        'skroutz.gr',
        'redtube.com',
        'harvard.edu',
        'shein.com',
        'merriam-webster.com',
        'nanxie.tmall.com',
        'ouo.io',
        'mos.ru',
        'fool.com',
        'livedoor.jp',
        'emojipedia.org',
        'google.co.za',
        'cyberleninka.ru',
        'correios.com.br',
        'lenovo.com',
        'kissanime.ru',
        'mega.nz',
        'huawei.com',
        'sudannews365.org',
        'banggood.com',
        'pikiran-rakyat.com',
        '11st.co.kr',
        'thefreedictionary.com',
        'autodesk.com',
        'zol.com.cn',
        'jizokuka-kyufu.jp',
        'jia.tmall.com',
        'alsbbora.info',
        'newegg.com',
        'fun48.com',
        'shopee.vn',
        'chegg.com',
        'alicdn.com',
        'wiktionary.org',
        'qualtrics.com',
        'pchome.com.tw',
        'ndtv.com',
        'impots.gouv.fr',
        'google.com.pk',
        'maniform.tmall.com',
        'ecomhunt.com',
        'librus.pl',
        'study.com',
        'socialblade.com',
        'utorrent.com',
        'myworkday.com',
        'pulzo.com',
        'edx.org',
        'accuweather.com',
        'europa.eu',
        'teespring.com',
        'upwork.com',
        'elcomercio.com',
        'yixiin.com',
        'capitalone.com',
        'milliyet.com.tr',
        'pixiv.net',
        '360doc.com',
        'timeanddate.com',
        'asus.com',
        'farfetch.com',
        'powerbi.com',
        'focus.cn',
        'msi.com',
        'amazon.com.au',
        'webinarjam.com',
        'chron.com',
        'iyiou.com',
        'ku.tmall.com',
        'it168.com',
        'huffpost.com',
        'threegun.tmall.com',
        'olx.com.br',
        'nicsorts-accarade.com',
        'basichouse.tmall.com',
        'google.be',
        'fairwhale.tmall.com',
        'xe.com',
        'viva.co.id',
        'elwatannews.com',
        'marca.com',
        'kinsta.com',
        'crhoy.com',
        'spzs.com',
        'constantcontact.com',
        'dagospia.com',
        'runoob.com',
        'dictionary.com',
        'ceconline.com',
        'biblegateway.com',
        'pixlr.com',
        'folha.uol.com.br',
        'ezgif.com',
        'hubspot.com',
        'ebay.it',
        'getpocket.com',
        'saednews.com',
        'smartsheet.com',
        'baike.com',
        'dafont.com',
        'icloud.com',
        'online-convert.com',
        'royalbank.com',
        'kq36.com',
        'google.ch',
        'cna.com.tw',
        'gmarket.co.kr',
        'prezi.com',
        'mfisp.com',
        'srvtrck.com',
        'mynavi.jp',
        'dreamstime.com',
        'marksandspencer.tmall.com',
        'sozcu.com.tr',
        'iherb.com',
        'nanzhuang.tmall.com',
        'ekaie.com',
        'rutracker.org',
        'anta.tmall.com',
        'ibicn.com',
        'bancodevenezuela.com',
        'convertio.co',
        'howtogeek.com',
        'khabarpu.com',
        'www.gov.cn',
        'service-now.com',
        'thewhizmarketing.com',
        'feedly.com',
        'theepochtimes.com',
        'myway.com',
        'rokna.net',
        'asriran.com',
        'themeforest.net',
        'cabbeen.tmall.com',
        'ibm.com',
        'cnki.net',
        'cisco.com',
        'dikaiologitika.gr',
        'kknews.cc',
        'as.com',
        'ptt.cc',
        'wt.tmall.com',
        'inps.it',
        'presslogic.com',
        'kijiji.ca',
        'banma.com',
        'forever21.tmall.com',
        'verizon.com',
        'zhcw.com',
        'topshop.tmall.com',
        'zhiding.cn',
        'it.tmall.com',
        'aliyuncs.com',
        'olx.ua',
        'ozon.ru',
        'nbcnews.com',
        'thehindu.com',
        'sdamgia.ru',
        'nownews.com',
        'nike.tmall.com',
        'quizizz.com',
        'free.fr',
        'mbc.net',
        'donga.com',
        'xero.com',
        'onlinebseb.in',
        'cdninstagram.com',
        'babyschool.com.cn',
        'jw.org',
        'superuser.com',
        'strava.com',
        'google.pt',
        'bmi.ir',
        'xianjichina.com',
        'haoyer.com',
        'new3c.tmall.com',
        'dickies.tmall.com',
        'gucn.tmall.com',
        'dw.com',
        'interia.pl',
        'semir.tmall.com',
        'lichess.org',
        'calvinklein.tmall.com',
        'taleo.net',
        'unsplash.com',
        'oschina.net',
        'bag.tmall.com',
        'mykajabi.com',
        'nur.kz',
        'gittigidiyor.com',
        'peacebird.tmall.com',
        'xbox.com',
        'google.nl',
        'pandora.com',
        'epwk.com',
        'india.com',
        'fazenda.gov.br',
        'onlyfans.com',
        'hamariweb.com',
        'book.tmall.com',
        'uzone.id',
        'nhk.or.jp',
        'y8.com',
        'shopee.co.th',
        'xabbs.com',
        'mismos.xyz',
        'youth.cn',
        'turkiye.gov.tr',
        'go.com',
        'jackjones.tmall.com',
        'youku.com',
        'desmos.com',
        'bitly.com',
        'samanese.ir',
        'bershka.tmall.com',
        'mawdoo3.com',
        'sehatq.com',
        'creditchina.gov.cn',
        'nvxie.tmall.com',
        'sci-hub.tw',
        'proiezionidiborsa.it',
        'exee.io',
        'enimerotiko.gr',
        'sitepoint.com',
        'cbsnews.com',
        'kundelik.kz',
        'spiegel.de',
        'overstock.com',
        '258.com',
        'storm.mg',
        'gamer.com.tw',
        'argaam.com',
        'baby.tmall.com',
        'banesconline.com',
        'kohls.com',
        'coursehero.com',
        'hi.ru',
        'akamaized.net',
        'rbc.ru',
        'eland.tmall.com',
        'zara.com',
        'langsha.tmall.com',
        'custhelp.com',
        'discover.com',
        'dcinside.com',
        'kaskus.co.id',
        'rsalcau.com',
        '91jm.com',
        'yaklass.ru',
        'android.com',
        '2m.ma',
        'yeniakit.com.tr',
        'storage.googleapis.com',
        'jb51.net',
        'yumpu.com',
        'earthmusic.tmall.com',
        'teacherspayteachers.com',
        'indiatoday.in',
        'mheducation.com',
        'hh.ru',
        'gridoto.com',
        'teamviewer.com',
        'dalfak.com',
        'iweihai.cn',
        'nairaland.com',
        'apkpure.com',
        'pcmag.com',
        'avg.com',
        'elegantthemes.com',
        'domaintools.com',
        'imis.tmall.com',
        'honeys.tmall.com',
        'tinder.com',
        'aofex.com',
        'exoclick.com',
        'alnaharegypt.com',
        'mailchimp.com',
        'mercadolibre.com',
        'cryptotabbrowser.com',
        'drudgereport.com',
        'khtahmar.com',
        'bzw315.com',
        'kahoot.it',
        'argentina.gob.ar',
        'google.com.my',
        '5ch.net',
        'neobux.com',
        'sports.tmall.com',
        'csdiran.com',
        'cnbeta.com',
        'intel.com',
        'shouji.tmall.com',
        'aarth.net',
        'house365.com',
        'etoro.com',
        'americanas.com.br',
        'mayoclinic.org',
        'ebay.fr',
        'myworkdayjobs.com',
        'statista.com',
        '3solo.biz',
        'nalog.ru',
        'sabah.com.tr',
        'nvidia.com',
        'rockstargames.com',
        'cpic.com.cn',
        'jia400.com',
        'usnews.com',
        'symbolab.com',
        'cdiscount.com',
        'ipo.hk',
        'asana.com',
        'kompasiana.com',
        'winshang.com',
        'aastocks.com',
        'telugu360.com',
        'motor1.com',
        'westernjournal.com',
        'nyaa.si',
        'torob.com',
        'zhaopin.com',
        'eatthis.com',
        'poki.com',
        'legit.ng',
        'urdupoint.com',
        'postlnk.com',
        'tempo.co',
        'cmoney.tw',
        'yournewtab.com',
        'flickr.com',
        'republika.co.id',
        'chaduo.com',
        'lafuma.tmall.com',
        'ebssw.kr',
        'iliangcang.com',
        'notjustok.com',
        'ny.gov',
        'haberzamani.com',
        'esprit.tmall.com',
        'lnkam.com',
        'newbalance.tmall.com',
        't-online.de',
        'livemint.com',
        'scofield.tmall.com',
        'jhu.edu',
        'powerapp.download',
        'car.tmall.com',
        'dawn.com',
        'depositphotos.com',
        'dianxiaomi.com',
        'zalo.me',
        'chinamenwang.com',
        'mercadolibre.com.ve',
        'myntra.com',
        'noticias.uol.com.br',
        'gearbest.com',
        'file-upload.com',
        'emalls.ir',
        'buyma.com',
        'dai.tmall.com',
        'fidelity.com',
        'businesstoday.com.tw',
        'classdojo.com',
        'bhaskar.com',
        'smm.cn',
        'dmm.com',
        'urfs.tmall.com',
        'kizlarsoruyor.com',
        'auction.co.kr',
        'rezka.ag',
        'nseindia.com',
        'drom.ru',
        'inquisitr.com',
        '126.com',
        'uniqlo.com',
        'ampugi334f.com',
        'vvvdj.com'
    ];
}