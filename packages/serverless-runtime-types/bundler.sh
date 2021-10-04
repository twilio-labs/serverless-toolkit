#!/bin/sh
awk -v RS= '!/^import /' ORS='\n\n' index.d.ts > index.temp.d.ts
(echo "$(cat types.d.ts)"; echo; echo "$(cat index.temp.d.ts)") > bundle.d.ts
rm -f index.temp.d.ts
