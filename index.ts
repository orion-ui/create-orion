#!/usr/bin/env node

import { intro, log, outro } from "@clack/prompts";
import { orionGradient } from "./utils/tools";
import OrionCreate from "./utils/OrionCreate";

(async () => {

  try {
    console.log();
    intro(orionGradient(`Orion UI - Another simple yet powerful UI framework`))
    
    const orionCreate = new OrionCreate();
    await orionCreate.init();

  } catch (e) {
    if (typeof e === 'string') {
      log.error(e);
      console.log();
    } else {
      log.error('Aborted');
      // eslint-disable-next-line no-console
      console.error('\n', e, '\n');
    }
    process.exit(0);
  } finally {
    outro(orionGradient(`Thank you for using Orion UI`));
    console.log();
  }

})();