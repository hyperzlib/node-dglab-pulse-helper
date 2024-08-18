import fs from 'fs';
import path from 'path';
import { v4 as uuid4 } from 'uuid';
import JSON5 from 'json5';

import { generateDGLabHexPulse } from "./DGLabPulseHelper";
import { loadQRCode, parseDGLabPulseUrl } from "./DGLabPulseQRHelper";
import { Command } from 'commander';

export interface DGLabPulseBaseInfo {
    id: string;
    name: string;
}

export interface CoyoteGameHubPulseInfo extends DGLabPulseBaseInfo {
    pulseData: string[];
}

function md5(data: Buffer) {
    return require('crypto').createHash('md5').update(data).digest('hex');
}

async function loadPulseQRCodes(pulseQRDir: string) {
    if (!fs.existsSync(pulseQRDir)) {
        return;
    }

    let pulseList: CoyoteGameHubPulseInfo[] = [];
    const pulseQRFiles = fs.readdirSync(pulseQRDir);
    for (const pulseQRFile of pulseQRFiles) {
        if (!pulseQRFile.match(/\.(jpe?g|png)$/i)) {
            continue;
        }

        const pulseQRFilePath = path.join(pulseQRDir, pulseQRFile);

        console.log('Loading pulse QR code: ' + pulseQRFile);

        try {
            let pulseUrl = await loadQRCode(pulseQRFilePath);
            let pulseData = await parseDGLabPulseUrl(pulseUrl);
            let pulseHexData = generateDGLabHexPulse(pulseData);

            let pulseName = pulseQRFile.replace(/\.(jpe?g|png)$/i, '').replace(/^\d+(-|_| )/, '');
            let pulseId = md5(Buffer.from(pulseHexData.join(''))).substring(0, 8);

            let pulseInfo: CoyoteGameHubPulseInfo = {
                id: pulseId,
                name: pulseName,
                pulseData: pulseHexData,
            };

            pulseList.push(pulseInfo);
        } catch (error: any) {
            console.error('Failed to load pulse QR code:', pulseQRFile, error);
            continue;
        }
    }
        
    return pulseList;
}

async function main() {
    const program = new Command();

    program
        .name('dglab-pulse-cli')
        .description('CLI to parse DGLab pulse QR code and generate pulse data for Coyote Game Hub')
        .version('0.1.0');

    program.command('generate')
        .description('Generate pulse data for Coyote Game Hub')
        .arguments('<pulseQRDir>')
        .option('-o, --output <outputFile>', 'Output pulse file')
        .action(async (pulseQRDir: string, options: { output: string }) => {
            let outputFile = options.output ?? 'pulse.json5';
            
            let pulseList = await loadPulseQRCodes(pulseQRDir);
            if (!pulseList) {
                console.error('No pulse QR code found');
                process.exit(1);
            }

            fs.writeFileSync(outputFile, JSON5.stringify(pulseList, null, 4));
        });

    program.parse();
}

main().catch(console.error);