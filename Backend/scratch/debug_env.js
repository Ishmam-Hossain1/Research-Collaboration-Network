import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('RUPANTORPAY_API_KEY:', process.env.RUPANTORPAY_API_KEY ? 'EXISTS' : 'MISSING');
console.log('RUPANTORPAY_URL:', process.env.RUPANTORPAY_URL ? 'EXISTS' : 'MISSING');
console.log('All Rupantor Keys:', Object.keys(process.env).filter(k => k.includes('RUPANTORPAY')));
