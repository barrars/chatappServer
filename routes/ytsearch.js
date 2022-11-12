// router for /songlist

const { default: YTDlpWrap } = require('yt-dlp-wrap-extended')
const path = require('path')
const logger = require('./myLogger')

async function getYTDL () {
  await YTDlpWrap.downloadFromGithub()
    .then((data) => {
      console.log(data)
      const ytDlpWrap = new YTDlpWrap('/home/scott/projects/chatappServer/yt-dlp')
      ytDlpWrap.getVersion()
        .then((data) => {
          console.log(data)
        })
    })
    .catch((err) => {
      console.log(err)
    })
}

// async function searchYT (req, res, next) {
//   await getYTDL().then(() => {
//     // console.log('ready to search')
//     ytDlpWrap.getVersion()
//       .then((data) => {
//         console.log(data)
//       })
//   })
// }

getYTDL()

// const audioDir = path.join(__dirname, '../public/downloads/%(title)s.%(ext)s')
// const ytDlpEventEmitter = ytDlpWrap
//   .exec([
//     'big buck bunny',
//     '--default-search',
//     'ytsearch',
//     '-x',
//     '--audio-format',
//     'mp3',
//     '-o',
//     `${audioDir}`
//   ])

//   // .on('progress', (progress) =>
//   //   console.log(
//   //     // progress.percent,
//   //     // progress.totalSize,
//   //     // progress.currentSpeed,
//   //     progress.eta
//   //   )
//   // )
//   .on('ytDlpEvent', (eventType, eventData) =>
//     logger.log({ eventType, eventData })
//   )
//   // .on('error', (error) => console.error(error))
//   .on('close', () => console.log('all done'))

// console.log(ytDlpEventEmitter.ytDlpProcess.pid)
