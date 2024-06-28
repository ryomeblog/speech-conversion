const translate = require('translate-google');
const record = require('node-record-lpcm16');
const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

const request = {
  config: {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
  },
  interimResults: false,
};

const recognizeStream = client
  .streamingRecognize(request)
  .on('error', console.error)
  .on('data', data => {
    if (data.results[0] && data.results[0].alternatives[0]) {
      const transcript = data.results[0].alternatives[0].transcript;
      console.log(`Transcription: ${transcript}`);
      
      // 翻訳部分
      const targetLanguage = 'ja'; // 翻訳先の言語コードを指定
      translate(transcript, { to: targetLanguage }).then((translatedText) => {
        console.log(`Translated Text: ${translatedText}`);
      }).catch((err) => {
        console.error('Error translating text:', err);
      });
    } else {
      console.log('\n\nReached transcription time limit, press Ctrl+C\n');
    }
  });

// 修正部分
record
  .record({
    sampleRateHertz: 16000,
    threshold: 0,
    recordProgram: 'sox', // "arecord" や "sox" も試してみてください
    silence: '10.0',
  })
  .stream()
  .on('error', console.error)
  .pipe(recognizeStream);

console.log('Listening, press Ctrl+C to stop.');