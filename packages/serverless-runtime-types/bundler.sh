#!/bin/sh
# Shell script to merge all the types files into bundle.d.ts
# bundle.d.ts can be added into Monaco/react editor, until Monaco supports
# importing multiple files.

# Append types.d.ts into bundle.d.ts
(cat types.d.ts && echo) > bundle.d.ts
# Remove the import statements from index.d.ts and append it to bundle.d.ts
(awk -v RS= '!/^import /' ORS='\n' index.d.ts) >> bundle.d.ts
