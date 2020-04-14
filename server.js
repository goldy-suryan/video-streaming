const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const path = require('path');
const cp = require('child_process');
const multer = require('multer');
const cors = require('cors');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/videos')
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname.replace(/[ &]/g, ''))
    }
});

// Middlewares
app.use(cors());
app.use(express.static(path.join(__dirname, 'uploads')));

app.get('/', async (req, res) => {
    try {
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/', multer({ storage }).single('file'), async (req, res) => {
    try {
        if (req.file) {
            let fileName = req.file.originalname.replace(/[ &]/g, '');
            let ext = path.extname(fileName);
            let filePath = `${__dirname}/uploads/videos`;
            let destPath = `${__dirname}/uploads/chunks`;
            if (ext == '.mp4' || ext == '.mkv') {
                cp.exec(`ffmpeg -i ${filePath}/${fileName} -profile:v baseline -level 3.0 -s 640x360 -start_number 0 -hls_time 20 -hls_list_size 0 -f hls ${destPath}/${fileName.slice(0, fileName.lastIndexOf('.') + 1)}m3u8`, (err, stdout, stderr) => {
                    if (err) {
                        return res.status(500).json({ success: false, error: err.message })
                    }
                    if (stderr) {
                        console.log(stderr, 'stderr');
                    }
                    return res.status(200).json({ success: true })
                })
            } else {
                return res.status(400).json({ success: false, message: 'Requested file does not support' });
            }
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})