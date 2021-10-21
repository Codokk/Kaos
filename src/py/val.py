import scrapy
import re
import sys
from scrapy.crawler import CrawlerProcess
# Set the arguments
args = {}
args['pythonFile'] =  sys.argv[0]

for arg in sys.argv[1:]:
  variable = re.search('\-\-(.*)\=',arg)
  variable = variable.group(1)
  value = re.search('\=(.*)',arg)
  value = value.group(1)
  args[variable] = value



class ValorantValidatorSpider(scrapy.Spider):
    name = 'valorantvalidator'

    def start_requests(self):
        name = args['tag'].split("#")
        yield scrapy.Request(url='https://tracker.gg/valorant/profile/riot/' + name[0] + "%23" + name[1] + "/overview", callback=self.parse)

    def parse(self, response):
        JSON = "{"
        resp = response.css("div.value").getall()
        Rank = re.sub("<.*?>","",resp[0])
        keys = response.css("div.main > div > div.wrapper > div.numbers > span.name").getall()
        values = response.css("div.main > div > div.wrapper > div.numbers > span.value").getall()
        cleanKeys = []
        cleanValues = []
        for i in range(len(keys) - 1):
            cleanKeys.append(re.sub("<.*?>","",keys[i]))
            cleanValues.append(re.sub("<.*?>","",values[i]))
            JSON += '"' + cleanKeys[i] + '":"' + cleanValues[i] + '",'
        JSON += '"Rank":"' + Rank + '"'
        JSON += "}"
        print(JSON)

process = CrawlerProcess()
process.crawl(ValorantValidatorSpider)
process.start()
