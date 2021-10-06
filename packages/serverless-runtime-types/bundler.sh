#!/bin/sh
# Shell script to merge all the types files into bundle.d.ts
# bundle.d.ts can be added into Monaco/react editor, until Monaco supports
# importing multiple files.

# Remove the import statements from index.d.ts and save it to index.temp.d.ts
awk -v RS= '!/^import /' ORS='\n\n' index.d.ts > index.temp.d.ts
# Merge types.d.ts and index.temp.d.ts into bundle.d.ts
(echo "$(cat types.d.ts)"; echo; echo "$(cat index.temp.d.ts)") > bundle.d.ts
# Remvoe the temp file
rm -f index.temp.d.ts
