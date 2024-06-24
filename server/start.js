import ngrok from 'ngrok'; 
import { spawn } from 'child_process'; 

(async () => { 
  try {
    const url = await ngrok.connect(3000); 
    console.log(`ngrok tunnel opened at ${url}`); 

    const receiveWhatsAppMessageProcess = spawn('node', ['receiveWhatsappMessage.js'], { stdio: 'inherit' }); 

    process.on('SIGINT', async () => { 
      console.log('Shutting down…'); 
      await ngrok.kill(); 
      receiveWhatsAppMessageProcess.kill('SIGINT'); 
      process.exit(0); 
    }); 
  } catch (error) {
    console.error('Error starting ngrok or spawning process:', error);
    process.exit(1);
  }
})();
