import { dirname } from 'path';

console.log(dirname(import.meta.url).replace('file://', ''));
