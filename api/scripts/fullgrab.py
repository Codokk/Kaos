import scrapy
from scrapy.crawler import CrawlerProcess
import pymongo

# MongoDB Init
MDB_CON_STR = "mongodb+srv://FantasyVLR:codyistiredofsecurepasswords@cluster0.0gyoi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
client = pymongo.MongoClient(MDB_CON_STR)
mdb = client.fantasyvlr

POBJ = {}
class EventsSpider(scrapy.Spider):
    name = 'events'
    allowed_domains = ['vlr.gg']
    start_urls = ['http://vlr.gg/events']

    def parse(self, response):
        eventURL = response.css(
            '.events-container-col:nth-child(1) > a.event-item::attr(href)').getall()
        eventHappening = response.css(
            '.events-container-col:nth-child(1) > a.event-item span.event-item-desc-item-status::text').getall()
        i = 0
        for url in eventURL:
            e = url.split('/')
            eid = e[2]
            ename = e[3]
            e = {
                u'_id': ename,
                u'URL': url,
                u'Name': ename,
                u'EventID': eid,
                u'Status': eventHappening[i]
            }
            mdb.events.update_one({"_id": e['_id']}, {'$set': e}, upsert=True)
            print("EVENT ADDED: " + e['_id'])
            i += 1


class TeamsSpider(scrapy.Spider):
    name = 'teams'

    def start_requests(self):
        events = mdb.events.find()
        for doc in events:
            yield scrapy.Request(url='https://vlr.gg' + doc["URL"], callback=self.parse)

    def parse(self, response):
        # Set the Event
        URL = response.url.replace("https://vlr.gg/", "").split("/")
        E_NAME = URL[5]
        TEAMS_INCLUDED = []
        teamURL = response.css(
            '''div.event-teams-container > div.event-team > a.event-team-name::attr(href)''').getall()
        tp = []
        i = 0
        for team in teamURL:
            t = team.split('/')
            tid = t[2]
            tname = t[3]
            TEAMS_INCLUDED.append(tname)
            T = {u"_id": tname, u"Name": tname, "TeamID": tid, "URL": team}
            mdb.teams.update_one({"_id": T['_id']}, {'$set': T}, upsert=True)
            print("Team Added: " + T['_id'])
            purls = response.css("div.event-teams-container > div.event-team:nth-child(" + str(
                i) + ") > div.event-team-players > a::attr(href)").getall()
            for purl in purls:
                p = purl.split("/")
                tp.append(
                    {"TeamID": tid, "PlayerID": p[2], "PlayerName": p[3], "URL": purl})
            i += 1
        mdb.events.update_one(
            {"_id": E_NAME}, {'$set': {"Teams": TEAMS_INCLUDED}}, upsert=True)
        for p in tp:
            p['_id'] = p["PlayerName"].lower()
            mdb.players.update_one({"_id": p['_id']}, {'$set': p}, upsert=True)
            print("Player Added: " + p['_id'])


class PlayerSpider(scrapy.Spider):
    name = 'playertest'

    def start_requests(self):
        plrs = mdb.players.find()
        for p in plrs:
            POBJ[p['PlayerName'].lower()] = p
            yield scrapy.Request(url="https://vlr.gg" + p["URL"], callback=self.parse)

    def parse(self, response):
        a = response.css("div.player-header h1.wf-title::text").getall()
        player = a[0].replace("\n", "").replace("\t", "").strip()
        rows = len(response.css('''table.wf-table > tbody > tr''').getall())
        i = 0
        statsArray = []
        AGENT = ""
        while i < rows:
            statObj = {}
            columns = ["Agent", "Usage", "RND", "ACS", "KD", "ADR",
                       "KPR", "APR", "FKPR", "FDPR", "K", "D", "A", "FK", "FD"]
            j = 0
            apd = ""
            while j < len(columns):
                if j == 0:
                    row = response.css("table.wf-table > tbody > tr:nth-child(" + str(
                        i+1) + ") > td:nth-child("+str(j+1)+") >  img::attr(src)").getall()
                    l = row[0].split("/")
                    row = l[len(l)-1].split(".")[0]
                else:
                    row = response.css("table.wf-table > tbody > tr:nth-child(" + str(
                        i+1) + ") > td:nth-child("+str(j+1)+") *::text").getall()
                apd = ""
                for item in row:
                    apd = apd + "" + item.replace("\n", "").replace("\t", "")
                if j == 0:
                    AGENT = apd
                else:
                    statObj[AGENT + "-" + columns[j]] = apd
                j += 1
            statsArray.append(statObj)
            for statitem in statObj:
                POBJ[player.lower()][statitem] = statObj[statitem]
            POBJ[player.lower()]['_id'] = player.lower()
            mdb.players.update_one({"_id": POBJ[player.lower()]['_id']}, {
                                   '$set': POBJ[player.lower()]}, upsert=True)
            print("Player Stats Added: " + player.lower() + " - " + AGENT)
            i += 1
        PLAYER_ARRAY = []

class NewsSpider(scrapy.Spider):
    name = "News Spider"
    start_urls = ['https://playvalorant.com/en-us/news/']

    def parse(self, response):
        newsURL = response.css(
            '.NewsArchive-module--newsCardWrapper--2OQiG > div > a::attr(href)').getall()
        for url in newsURL:
            print(url)

process = CrawlerProcess(settings={
    "FEEDS": {
        "out.json": {"format": "json"}
    }
})
process.crawl(EventsSpider)
process.crawl(TeamsSpider)
process.crawl(PlayerSpider)
# process.crawl(NewsSpider)
process.start()
