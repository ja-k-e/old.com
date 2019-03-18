const minNum = 1;
const maxNum = 240;
const prefix = "image-";
const ext = ".jpg";
const root = "http://jakealbaugh.com/images/bg";
const paths = ["hi", "lo"];
const destination = "src/images/bg";
const download = require("image-downloader");

const filenames = [];
for (let i = minNum; i <= maxNum; i++) filenames.push(`${prefix}${i}${ext}`);

process()
  .then(() => console.log("DOWNLOADED!"))
  .catch(console.error);

function process() {
  return new Promise(async (resolve, reject) => {
    let promises = [];
    paths.forEach(path => {
      const url = `${root}/${path}/`;
      const dest = `${destination}/${path}`;
      promises = promises.concat(
        filenames.map(fn => download.image({ url: `${url}${fn}`, dest }))
      );
    });
    try {
      await Promise.all(promises);
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}
