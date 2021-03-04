const {join} = require('path');
const { copyFile, mkdir } = require('fs').promises;

const contracts = ['Metadata', 'Folia', 'FoliaController'];

async function main(outdir) {
    if(!outdir) {
        console.log('Please specify an output dir')
        process.exit(1)
    } 
    console.log(`Export contracts metadata to "${outdir}"`)
    try {
      await mkdir(outdir);
    } catch (e) {
      if (e.code !== "EEXIST") {
        throw e;
      }
    }
    try {
        for (let contract of contracts) {
            let filename = contract + '.json';
            let infile = join('./build/contracts', filename);
            let outfile = join(outdir, filename)
            await copyFile(infile, outfile);
        }
    } catch(e){
        console.error(e);
    }
}

main(process.argv[2]);