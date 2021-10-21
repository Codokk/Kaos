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
        page = response.url.split("/")[-2]
        filename = f'quotes-{page}.html'
        with open(filename, 'wb') as f:
            f.write(response.body)
        self.log(f'Saved file {filename}')

process = CrawlerProcess(settings={
    "FEEDS": {
        "out.json": {"format": "json"}
    }
})
process.crawl(ValorantValidatorSpider)

process.start()
