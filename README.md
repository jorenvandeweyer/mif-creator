# mif-creator

Convert images to mif files.

Compression mode can save up to +90% for small or simple files don't dont use much different colors.

# Usage

Install:
`npm install`

Normal mode:
`npm start`

Compression mode:
`npm start -- --compres`

For compression mode there will be created a lookup table for the colors.
You need to implement that by forwarding the address to the .colors.mif memory module

```verilog
getColorAddress(.address(address), .clock(clock), .q(color_address))
resolveColorAddress(.address(color_address), .clock(clock), .q(color));
```
