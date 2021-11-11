import scrapy
import re
import sys
from scrapy.crawler import CrawlerProcess
from pymongo import MongoClient
import pymongo
import html2text
# Set the arguments
args = {}
args['pythonFile'] =  sys.argv[0]

for arg in sys.argv[1:]:
  variable = re.search('\-\-(.*)\=',arg)
  variable = variable.group(1)
  value = re.search('\=(.*)',arg)
  value = value.group(1)
  args[variable] = value

# DB Connection
CONNECTION_STRING = "mongodb+srv://FantasyVLR:codyistiredofsecurepasswords@cluster0.0gyoi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
client = MongoClient(CONNECTION_STRING)
mdb = client['fantasyvlr']

converter = html2text.HTML2Text()
converter.ignore_links = True


class ValorantValidatorSpider(scrapy.Spider):
    name = 'valorantvalidator'

    def start_requests(self):
        events = mdb['events'].find()
        for event in events:
            print(event)
            yield scrapy.Request(url='https://vlr.gg/event/matches/'+event['EventID'], callback=self.parse)

    def parse(self, response):
        eid = re.sub("https://www.vlr.gg/event/matches/","",response.url)
        print(eid)
        matches = response.css(".wf-module-item.match-item")
        events  = mdb['events']
        p = re.compile(r'<.*?>')
        for match in matches:
            teams = match.css('.text-of').extract()
            # 4 results - t1, t2, phase, stage
            t = []
            for team in teams:
                team = p.sub('',team)
                team = re.sub(" +","",team)
                team = re.sub("\n","",team)
                team = re.sub("\t","",team)
                t.append(p.sub('',team))
            events.update_one({"EventID":eid},{"$set":{"dta":t}})
            print("-----------------")

process = CrawlerProcess()
process.crawl(ValorantValidatorSpider)
process.start()
