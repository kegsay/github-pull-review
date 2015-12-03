import codecs
import json
import os
import os.path
import sys

if len(sys.argv) != 3:
    sys.stderr.write("usage: %s file.har out_dir\n" % (sys.argv[0],))
    sys.exit(1)

har_file = sys.argv[1]
out_dir = sys.argv[2]

with open(har_file, "r") as f:
    har = json.loads(f.read())

prefix = "https://api.github.com/"

for entry in har["log"]["entries"]:
    if entry["request"]["url"].startswith(prefix):
        out = os.path.join(out_dir, entry["request"]["url"][len(prefix):], "index.html")
        os.makedirs(os.path.dirname(out))
        with codecs.open(out, "w", "utf-8") as f:
            f.write(entry["response"]["content"]["text"])
