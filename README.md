# Node DG-Lab Pulse Helper

用于使用Nodejs读取DG-Lab的波形二维码，以及从波形二维码生成 [Coyote-Game-Hub](https://github.com/hyperzlib/DG-Lab-Coyote-Game-Hub) 使用的波形数据。

## 命令行用法

```text
Usage: dglab-pulse-cli generate [options] <pulseQRDir>

Generate pulse data for Coyote Game Hub

Options:
  -o, --output <outputFile>  Output pulse file
  -h, --help                 display help for command
```

## 用法示例

```bash
dglab-pulse-cli generate -o pulse.json5 ./examples/pulse-qrcode
```

## Nodejs API

```typescript
/** 读取二维码信息 */
export declare function loadQRCode(filePath: string): Promise<string>;

/** 解析DG-Lab波形URL */
export declare function parseDGLabPulseUrl(url: string): Promise<DGLabPulseInfo>;

/** 从DG-Lab波形二维码文件加载波形信息 */
export declare function loadDGLabPulseQRCode(filePath: string): Promise<DGLabPulseInfo>;

/** 从波形信息生成hex字符串形式的波形数据，用于WebSocket API */
export declare function generateDGLabHexPulse(pulse: DGLabPulseInfo): string[];
```
