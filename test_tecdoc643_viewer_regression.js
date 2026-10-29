#!/usr/bin/env node
/**
 * Comprehensive Headless Chrome Regression Test Suite for Oklo Shareable Portal
 *
 * Verifies:
 * 1. Gate 0 Provenance & Frozen Fixture Integrity (artifact_index.xml + README.md + benchmark_manifest.json SHA-256 & byte counts)
 * 2. Hidden-Tab Lazy Initialization (iframeNw, iframePool, iframeBio, iframeR0 deferred while on Tab 1)
 * 3. Tab 2: TECDOC-643 Neutron Walk 3-D WebGL Rendering & Live Tally
 * 4. Tab 3: Side-by-Side Split-View Layout
 * 5. Tab 4: Biofilms 3-D Cellular Potts WebGL, MCS 0/100 Arms & 256-Seed 4-Arm TOST Statistical Integrity
 * 6. Tab 6: Pool-Water Interactive 3-D WebGL, Gate 0-4 Acceptance Suite, Timeline Scrubbing & Explicit UNAVAILABLE Field Honesty
 * 7. Tab 7: Coupled Comparison Synchronization Gate (INDEPENDENT_REFERENCE_PANELS default + shared MTR blade-withdrawal scenario sync)
 * 8. Disabled-WebGL Exception Fallback (2-D Slice / Cut-Plane fallback in Biofilms 3-D and Pool-Water Interactive)
 */

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = __dirname;
const CHROME_BIN = process.env.CHROME_BIN || (
  fs.existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : (fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : '/usr/bin/chromium-browser')
);

function sha256File(relPath) {
  const buf = fs.readFileSync(path.join(ROOT, relPath));
  return {
    bytes: buf.length,
    sha256: crypto.createHash('sha256').update(buf).digest('hex')
  };
}

function verifyArtifactHashes() {
  const xml = fs.readFileSync(path.join(ROOT, 'artifact_index.xml'), 'utf8');
  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const manifest = fs.readFileSync(path.join(ROOT, 'benchmark_manifest.json'), 'utf8');

  const expectedFiles = [
    {
      path: 'oklo_r0_fixture_readonly.html',
      sha256: '8dac3ae9b8268a476b791f8c2293130e899d5c86c7fab09ce27345de2333544d',
      bytes: 77117
    },
    {
      path: 'CONFORMANCE_FIXTURE_SPEC.md',
      sha256: '587745ede6c6997a298f8f0a4e01127823de1b7c606383cfa49b87db0cc60d0c',
      bytes: 20743
    },
    {
      path: 'spacetime_explorer_4d_shareable.html',
      sha256: 'f9ca39ea37503f0e2012ad3dd5aad05ef26709337d5e84f83df89234920b4612',
      bytes: 132358
    },
    {
      path: 'tecdoc643_neutron_walk.html',
      sha256: 'dc15eb934fe6cd32a084dc13d05ee17d8f5ad988f7ea1bd2598bdcd9a0065b78',
      bytes: 937606
    },
    {
      path: 'tecdoc643_reference_fixture.jl',
      sha256: '15eb6da017d610109bdcd03dc568ff243a3dae80399e5b33638c6166bd786294',
      bytes: 6040
    },
    {
      path: 'biofilms_3d_explorer.html',
      sha256: 'eea45e31e898c2f5fc2623d38767311ab74650570b80823138f0d9b7f6f553c2',
      bytes: 869353
    },
    {
      path: 'poolwater_interactive.html',
      sha256: '34b3e9f50689dd5f1ee6a7ee252996f0ff5a6a3410b33c353dd0cd2783feb964',
      bytes: 79614
    },
    {
      path: 'POOLWATER_WORKFLOW_SPEC.md',
      sha256: '2963fb4dbf511dc5cde10a0b939533cfa81fc8906fd45156268a711979ff26fb',
      bytes: 36107
    },
    {
      path: 'multispecies_biofilm_robin_cylindrical_4panel.gif',
      sha256: 'e73622d6454a3a6ad16af88f15b8d5e21161c801d51059050244303af5148997',
      bytes: 2571435
    },
    {
      path: 'clonal_sector_expansion_reference.jpg',
      sha256: '67865f346f4d23835707174251eb589f72f344637ac221fbff427169fc34f115',
      bytes: 159146
    },
    {
      path: 'magnetoreception_3d_explorer.html',
      sha256: '335039227479d9704f0e71122624e4ba21d050b7ab2f1c580509ea5cfdf04bcb',
      bytes: 263873
    },
    {
      path: 'reactor_pool_biofilm_explorer.html',
      sha256: '09bb3d9cbca7757c3630d48b50c344f04694522d1d991f8b1f53ef38a9c8d694',
      bytes: 204031
    },
    {
      path: 'oklo_hydrothermal_cycle_explorer.html',
      sha256: '823ce4131280e21d4b520555d2362cb9fd2651c9ee899a1aeafb21cf966ccfe0',
      bytes: 107429
    },
    {
      path: 'oklo_coupled_hydrothermal_cycle.cxc',
      sha256: 'a891f9dd5433fdd05a69ff71df95625dfd0433e8aace3ce0908b1a1186640742',
      bytes: 8978
    },
    {
      path: 'evidence_manifest.json',
      sha256: '4f61d995772ee055fd0df378d4884bc8b2a2be235877ffc4b4424fc519f9cacf',
      bytes: 116876
    },
    {
      path: 'test_calculation_provenance_and_invariants.js',
      sha256: '332ff7007e41b1139522bb88255b23cc22d8ce0effb071c3a3244316251252e4',
      bytes: 81455
    },
    {
      path: 'benchmark_manifest.json',
      sha256: '007e97bb163b84100a659c0c8e0c30bb6e40dd3ecf3d20161675d6908c5f6217',
      bytes: 32785
    }
  ];

  for (const item of expectedFiles) {
    const actual = sha256File(item.path);
    assert.strictEqual(actual.bytes, item.bytes, `${item.path} byte size mismatch`);
    assert.strictEqual(actual.sha256, item.sha256, `${item.path} SHA-256 mismatch`);
    assert.ok(xml.includes(item.sha256), `artifact_index.xml missing SHA-256 for ${item.path}`);
    assert.ok(readme.includes(item.sha256), `README.md missing SHA-256 for ${item.path}`);
    if (item.path !== 'benchmark_manifest.json') {
      assert.ok(manifest.includes(item.sha256), `benchmark_manifest.json missing SHA-256 for ${item.path}`);
    }
  }
  const manifestObj = JSON.parse(manifest);
  const g0Entries = Object.values(manifestObj.gate_0_frozen_inputs || {});
  assert.ok(g0Entries.length >= 9, 'benchmark_manifest.json gate_0_frozen_inputs missing');
  for (const g0 of g0Entries) {
    const aMain = sha256File(g0.relative_path);
    assert.strictEqual(aMain.bytes, g0.bytes, `gate_0_frozen_inputs ${g0.relative_path} bytes mismatch`);
    assert.strictEqual(aMain.sha256, g0.sha256, `gate_0_frozen_inputs ${g0.relative_path} sha256 mismatch`);
    if (g0.spec_relative_path) {
      const aSpec = sha256File(g0.spec_relative_path);
      assert.strictEqual(aSpec.bytes, g0.spec_bytes, `gate_0_frozen_inputs ${g0.spec_relative_path} bytes mismatch`);
      assert.strictEqual(aSpec.sha256, g0.spec_sha256, `gate_0_frozen_inputs ${g0.spec_relative_path} sha256 mismatch`);
    }
    if (g0.companion_reference_relative_path) {
      const aComp = sha256File(g0.companion_reference_relative_path);
      assert.strictEqual(aComp.bytes, g0.companion_reference_bytes, `gate_0_frozen_inputs ${g0.companion_reference_relative_path} bytes mismatch`);
      assert.strictEqual(aComp.sha256, g0.companion_reference_sha256, `gate_0_frozen_inputs ${g0.companion_reference_relative_path} sha256 mismatch`);
    }
    if (g0.evidence_manifest_relative_path) {
      const aEv = sha256File(g0.evidence_manifest_relative_path);
      assert.strictEqual(aEv.bytes, g0.evidence_manifest_bytes, `gate_0_frozen_inputs ${g0.evidence_manifest_relative_path} bytes mismatch`);
      assert.strictEqual(aEv.sha256, g0.evidence_manifest_sha256, `gate_0_frozen_inputs ${g0.evidence_manifest_relative_path} sha256 mismatch`);
    }
    if (g0.invariant_test_relative_path) {
      const aInv = sha256File(g0.invariant_test_relative_path);
      assert.strictEqual(aInv.bytes, g0.invariant_test_bytes, `gate_0_frozen_inputs ${g0.invariant_test_relative_path} bytes mismatch`);
      assert.strictEqual(aInv.sha256, g0.invariant_test_sha256, `gate_0_frozen_inputs ${g0.invariant_test_relative_path} sha256 mismatch`);
    }
  }
  assert.ok(indexHtml.includes('dc15eb934fe6cd32...'), 'index.html missing Gate-0 REF-NW-HTML-01 SHA prefix');
  assert.ok(indexHtml.includes('34b3e9f50689dd5f...'), 'index.html missing POOLWATER-3D-INTERACTIVE-01 SHA prefix');
  assert.ok(indexHtml.includes('eea45e31e898c2f5...'), 'index.html missing BIOFILMS-3D-CPM-01 SHA prefix');
  assert.ok(indexHtml.includes('e73622d6454a3a6a...'), 'index.html missing BIOFILMS-ROBIN-CYL-GIF-01 SHA prefix');
  assert.ok(indexHtml.includes('335039227479d970...'), 'index.html missing BIOTITE-MAGNETORECEPTION-4D-01 SHA prefix');
  assert.ok(indexHtml.includes('09bb3d9cbca7757c...'), 'index.html missing REACTOR-POOL-BIOFILM-COORDINATED-3D-01 SHA prefix');
  assert.ok(indexHtml.includes('823ce4131280e21d...'), 'index.html missing OKLO-HYDROTHERMAL-CYCLE-COUPLED-3D-01 SHA prefix');
  console.log('PASS [1/15]: Gate-0 artifact hashes, byte counts, and manifests verified.');
  return expectedFiles;
}

const net = require('net');

function getFreePort(preferred = 0) {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', () => {
      const fallback = net.createServer();
      fallback.unref();
      fallback.on('error', reject);
      fallback.listen(0, '127.0.0.1', () => {
        const p = fallback.address().port;
        fallback.close(() => resolve(p));
      });
    });
    srv.listen(preferred, '127.0.0.1', () => {
      const p = srv.address().port;
      srv.close(() => resolve(p));
    });
  });
}

async function startStaticServer(preferredPort) {
  const actualPort = await getFreePort(preferredPort);
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const u = req.url.split('?')[0].split('#')[0];
      const fp = path.join(ROOT, u === '/' ? 'index.html' : u.slice(1));
      if (!fs.existsSync(fp)) {
        res.writeHead(404);
        return res.end();
      }
      const ext = path.extname(fp);
      const mime =
        ext === '.html' ? 'text/html' :
        ext === '.js' ? 'text/javascript' :
        ext === '.json' ? 'application/json' :
        ext === '.gif' ? 'image/gif' :
        ext === '.mp4' ? 'video/mp4' :
        ext === '.mrc' || ext === '.cxs' ? 'application/octet-stream' :
        ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
        ext === '.png' ? 'image/png' :
        ext === '.xml' ? 'application/xml' : 'text/plain';
      const buf = fs.readFileSync(fp);
      const total = buf.length;
      const rangeHeader = req.headers.range;
      if (rangeHeader && rangeHeader.startsWith('bytes=')) {
        const parts = rangeHeader.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
        if (!Number.isNaN(start) && !Number.isNaN(end) && start >= 0 && end < total && start <= end) {
          const chunk = buf.subarray(start, end + 1);
          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${total}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunk.length,
            'Content-Type': mime
          });
          return res.end(chunk);
        }
        res.writeHead(416, { 'Content-Range': `bytes */${total}` });
        return res.end();
      }
      res.writeHead(200, {
        'Content-Type': mime,
        'Content-Length': total,
        'Accept-Ranges': 'bytes'
      });
      res.end(buf);
    });
    server.listen(actualPort, '127.0.0.1', () => resolve({ server, port: actualPort }));
  });
}

async function withChromeSession(chromeFlags, port, preferredDebugPort, fn) {
  const debugPort = await getFreePort(preferredDebugPort);
  const userDataDir = `/tmp/oklo-test-chrome-${debugPort}-${Date.now()}`;
  const chrome = spawn(CHROME_BIN, [
    '--headless=new',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    `--user-data-dir=${userDataDir}`,
    `--remote-debugging-port=${debugPort}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,900',
    ...chromeFlags,
    `http://127.0.0.1:${port}/index.html`
  ]);

  try {
    let tabs = null;
    for (let attempt = 0; attempt < 100; attempt++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        tabs = await fetch(`http://127.0.0.1:${debugPort}/json`).then(r => r.json());
        if (Array.isArray(tabs) && tabs.some(t => t.type === 'page' && t.url && t.url.includes('index.html'))) break;
      } catch (_) {}
    }
    const page = Array.isArray(tabs) ? tabs.find(t => t.type === 'page' && t.url && t.url.includes('index.html')) : null;
    assert.ok(page, `Failed to attach to index.html page target in Chrome on debugPort ${debugPort}`);
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', err => reject(new Error(`WebSocket connection error on debugPort ${debugPort}: ${err.message || err}`)), { once: true });
    });

    let msgId = 0;
    const call = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const cid = ++msgId;
        const cleanup = () => {
          ws.removeEventListener('message', handler);
          ws.removeEventListener('error', errHandler);
          ws.removeEventListener('close', closeHandler);
        };
        const handler = ev => {
          const msg = JSON.parse(ev.data);
          if (msg.id === cid) {
            cleanup();
            resolve(msg);
          }
        };
        const errHandler = err => {
          cleanup();
          reject(new Error(`CDP WebSocket error during ${method}: ${err.message || err}`));
        };
        const closeHandler = () => {
          cleanup();
          reject(new Error(`CDP WebSocket closed unexpectedly during ${method}`));
        };
        ws.addEventListener('message', handler);
        ws.addEventListener('error', errHandler);
        ws.addEventListener('close', closeHandler);
        ws.send(JSON.stringify({ id: cid, method, params }));
      });

    await call('Runtime.enable');
    const evalJson = async expr => {
      const res = await call('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (res.result && res.result.exceptionDetails) {
        throw new Error(res.result.exceptionDetails.exception.description || 'Runtime.evaluate error');
      }
      return JSON.parse(res.result.result.value);
    };

    await fn(evalJson);
    ws.close();
  } finally {
    try {
      chrome.kill('SIGKILL');
    } catch (_) {}
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (_) {}
  }
}

async function runTests() {
  const verifiedFiles = verifyArtifactHashes();
  const { server, port } = await startStaticServer(8776);
  const receipt = {
    schema: 'oklo_portal_ci_verification_receipt_v1',
    generated_at: new Date().toISOString(),
    gate0_files_verified: verifiedFiles.length,
    tests: {}
  };

  try {
    // Session A: WebGL enabled via SwiftShader ANGLE
    await withChromeSession(
      ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
      port,
      9237,
      async evalJson => {
        // Test 2: Hidden-tab initialization on Tab 1
        const tab1State = await evalJson(`(() => {
          const ifrNw = document.getElementById('iframeNw');
          const ifrPool = document.getElementById('iframePool');
          const ifrBio = document.getElementById('iframeBio');
          const ifrMag = document.getElementById('iframeMagneto');
          const ifrPB = document.getElementById('iframePoolBiofilm');
          const cNw = document.getElementById('cardNw');
          const cPool = document.getElementById('cardPool');
          const cMag = document.getElementById('cardMagneto');
          const cPB = document.getElementById('cardPoolBiofilm');
          return JSON.stringify({
            nwSrc: ifrNw.getAttribute('src'),
            nwDataSrc: ifrNw.getAttribute('data-src'),
            poolSrc: ifrPool.getAttribute('src'),
            poolDataSrc: ifrPool.getAttribute('data-src'),
            bioSrc: ifrBio.getAttribute('src'),
            magSrc: ifrMag.getAttribute('src'),
            magDataSrc: ifrMag.getAttribute('data-src'),
            pbSrc: ifrPB.getAttribute('src'),
            pbDataSrc: ifrPB.getAttribute('data-src'),
            nwHiddenClass: cNw.classList.contains('is-hidden'),
            poolHiddenClass: cPool.classList.contains('is-hidden'),
            magHiddenClass: cMag.classList.contains('is-hidden'),
            pbHiddenClass: cPB.classList.contains('is-hidden')
          });
        })()`);
        assert.strictEqual(tab1State.nwSrc, null, 'iframeNw should not load eagerly while on Tab 1');
        assert.strictEqual(tab1State.poolSrc, null, 'iframePool should not load eagerly while on Tab 1');
        assert.strictEqual(tab1State.bioSrc, null, 'iframeBio should not load eagerly while on Tab 1');
        assert.strictEqual(tab1State.magSrc, null, 'iframeMagneto should not load eagerly while on Tab 1');
        assert.strictEqual(tab1State.pbSrc, null, 'iframePoolBiofilm should not load eagerly while on Tab 1');
        assert.strictEqual(tab1State.nwDataSrc, 'tecdoc643_neutron_walk.html');
        assert.strictEqual(tab1State.poolDataSrc, 'poolwater_interactive.html');
        assert.strictEqual(tab1State.magDataSrc, 'magnetoreception_3d_explorer.html');
        assert.strictEqual(tab1State.pbDataSrc, 'reactor_pool_biofilm_explorer.html');
        assert.strictEqual(tab1State.nwHiddenClass, true);
        assert.strictEqual(tab1State.poolHiddenClass, true);
        assert.strictEqual(tab1State.magHiddenClass, true);
        assert.strictEqual(tab1State.pbHiddenClass, true);
        console.log('PASS [2/15]: Hidden-tab lazy initialization verified (iframeNw, iframePool, iframeBio, iframeMagneto, iframePoolBiofilm deferred on Tab 1).');
        receipt.tests.lazy_init = 'PASS';

        // Test 3: Normal 3-D WebGL rendering on Tab 2 (unmodified Gate-0 tecdoc643_neutron_walk.html)
        await evalJson(`(() => { setView('nw'); return 'true'; })()`);
        await new Promise(r => setTimeout(r, 2500));
        const nw3dState = await evalJson(`(() => {
          const ifr = document.getElementById('iframeNw');
          const d = ifr.contentDocument;
          const gl = d.getElementById('gl');
          const sl = d.getElementById('sl');
          const kval = d.getElementById('kval').textContent;
          const ntot = d.getElementById('ntot').textContent;
          return JSON.stringify({
            glWidth: gl.width,
            glHeight: gl.height,
            glHidden: gl.hidden,
            slHidden: sl.hidden,
            kval,
            ntot
          });
        })()`);
        assert.strictEqual(nw3dState.glHidden, false, '3-D canvas should be visible');
        assert.strictEqual(nw3dState.slHidden, true, '2-D Slice canvas should be hidden in 3-D mode');
        assert.ok(nw3dState.glWidth > 400 && nw3dState.glHeight > 300, `Expected non-zero 3-D canvas size, got ${nw3dState.glWidth}x${nw3dState.glHeight}`);
        assert.notStrictEqual(nw3dState.kval, '\u2014', 'Tally k-eff should be computed');
        assert.ok(!nw3dState.ntot.includes('(0 neutrons)'), `Expected live neutron tally, got ${nw3dState.ntot}`);
        console.log(`PASS [3/13]: TECDOC-643 3-D WebGL rendering verified on unmodified Gate-0 HTML (gl=${nw3dState.glWidth}x${nw3dState.glHeight}, k=${nw3dState.kval}).`);
        receipt.tests.tecdoc643_3d_webgl = nw3dState;

        // Test 4: Tab 3 Side-by-Side Split-View Layout (4D Spacetime + TECDOC-643 Neutron Walk)
        await evalJson(`(() => { setView('split'); return 'true'; })()`);
        await new Promise(r => setTimeout(r, 500));
        const splitState = await evalJson(`(() => {
          const grid = document.getElementById('viewerGrid');
          const c4d = document.getElementById('card4d');
          const cNw = document.getElementById('cardNw');
          const cPool = document.getElementById('cardPool');
          return JSON.stringify({
            splitClass: grid.classList.contains('split'),
            c4dHidden: c4d.classList.contains('is-hidden'),
            cNwHidden: cNw.classList.contains('is-hidden'),
            cPoolHidden: cPool.classList.contains('is-hidden')
          });
        })()`);
        assert.strictEqual(splitState.splitClass, true);
        assert.strictEqual(splitState.c4dHidden, false);
        assert.strictEqual(splitState.cNwHidden, false);
        assert.strictEqual(splitState.cPoolHidden, true);
        console.log('PASS [4/13]: Tab 3 Side-by-Side Split-View layout verified (card4d + cardNw visible).');
        receipt.tests.split_view_layout = splitState;

        // Test 5: Biofilms 3-D Explorer WebGL rendering, 256-Seed 4-Arm TOST & #btnEnsSelection (cpm-sp-v1 H0-B vs H0-A + 15/16 phase-locking)
        await evalJson(`(() => { setView('bio'); return 'true'; })()`);
        await new Promise(r => setTimeout(r, 1500));
        const bio3dState = await evalJson(`(() => {
          const ifr = document.getElementById('iframeBio');
          const d = ifr.contentDocument;
          const gl = d.getElementById('glCanvas');
          const ens = d.getElementById('ensembleCanvas');
          const kpiOcc = d.getElementById('kpiOcc').textContent;
          const slider = d.getElementById('mcsSlider');
          slider.value = '0';
          slider.dispatchEvent(new Event('input'));
          const kpiOcc0 = d.getElementById('kpiOcc').textContent;
          const kpiMatch0 = d.getElementById('kpiMatch').textContent;
          d.getElementById('btnModeEnsemble').click();
          d.getElementById('btnEnsContrast').click();
          const btnContrastOnBefore = d.getElementById('btnEnsContrast').classList.contains('on');
          d.getElementById('btnEnsSelection').click();
          const stageHintTxt = d.getElementById('stageHint').textContent;
          const btnSelectionActive = d.getElementById('btnEnsSelection').classList.contains('on');
          const btnContrastOnAfter = d.getElementById('btnEnsContrast').classList.contains('on');
          const statsAudit = ifr.contentWindow.verifyEnsembleStatisticalIntegrity();
          return JSON.stringify({
            embedded: d.documentElement.getAttribute('data-embedded'),
            glWidth: gl.width,
            glHeight: gl.height,
            ensHiddenAfterClick: ens.hidden,
            ensWidth: ens.width,
            ensHeight: ens.height,
            kpiOcc100: kpiOcc,
            kpiOcc0,
            kpiMatch0,
            btnContrastOnBefore,
            btnContrastOnAfter,
            stageHintTxt,
            btnSelectionActive,
            manifestSha: d.getElementById('manifestSha').textContent,
            statsAudit
          });
        })()`);
        assert.strictEqual(bio3dState.embedded, '1');
        assert.ok(bio3dState.glWidth > 400 && bio3dState.glHeight > 350);
        assert.strictEqual(bio3dState.ensHiddenAfterClick, false);
        assert.strictEqual(bio3dState.kpiOcc100, '4,888');
        assert.strictEqual(bio3dState.kpiOcc0, '3,038');
        assert.strictEqual(bio3dState.kpiMatch0, '100.0%');
        assert.strictEqual(bio3dState.btnContrastOnBefore, true);
        assert.strictEqual(bio3dState.btnSelectionActive, true);
        assert.strictEqual(bio3dState.btnContrastOnAfter, false);
        assert.ok(bio3dState.stageHintTxt.includes('256-Seed 4-Arm Ensemble'));
        assert.strictEqual(bio3dState.statsAudit.seedCount, 256);
        assert.strictEqual(bio3dState.statsAudit.allSpeciesHave256PerArm, true);
        assert.strictEqual(bio3dState.statsAudit.allSeedKeyOrderInvariant, true);
        assert.strictEqual(bio3dState.statsAudit.allCiMatchReference, true);
        assert.strictEqual(bio3dState.statsAudit.allContrastsWithinEquivalenceBound, true);
        console.log(`PASS [5/13]: Biofilms 3-D WebGL, 256-Seed 4-Arm TOST & #btnEnsSelection (cpm-sp-v1 H0-B vs H0-A + 15/16 phase-locking) verified (${bio3dState.glWidth}x${bio3dState.glHeight}, 256 seeds).`);
        receipt.tests.biofilms_3d_and_256_seed_tost = {
          glWidth: bio3dState.glWidth,
          glHeight: bio3dState.glHeight,
          seedCount: bio3dState.statsAudit.seedCount,
          allContrastsWithinEquivalenceBound: bio3dState.statsAudit.allContrastsWithinEquivalenceBound,
          selectionViewVerified: bio3dState.btnSelectionActive
        };

        // Test 6: Pool-Water Interactive Viewer (Tab 6) WebGL, Gate 0-4 Acceptance Suite (including 6x7 lattice, 84.191 pcm 2M sigma, 5-row matrix, 4-layer GLMM), Timeline Scrubbing & UNAVAILABLE Field Honesty
        await evalJson(`(() => { setView('pool'); return 'true'; })()`);
        await new Promise(r => setTimeout(r, 1500));
        const poolState = await evalJson(`(() => {
          const ifr = document.getElementById('iframePool');
          const d = ifr.contentDocument;
          const w = ifr.contentWindow;
          const gl = d.getElementById('glCanvas');
          const sl = d.getElementById('sliceCanvas');
          const au = d.getElementById('auditCanvas');
          const gates = w.verifyPoolWaterAcceptanceGates();

          // Scrub time to index 5 (600 s)
          const tSlider = d.getElementById('timeSlider');
          tSlider.value = '5';
          tSlider.dispatchEvent(new Event('input'));
          const timeLabel5 = d.getElementById('timeLabel').textContent;
          const kpiTemp5 = d.getElementById('kpiTemp').textContent;

          // Select an explicitly UNAVAILABLE field and verify it switches to 2D notice without fabricating values
          const selField = d.getElementById('selField');
          selField.value = 'validated_cfd_pressure_Pa';
          selField.dispatchEvent(new Event('change'));
          const unavailGlHidden = gl.hidden;
          const unavailSlHidden = sl.hidden;
          const chipFieldUnavail = d.getElementById('chipField').textContent;

          // Restore water_temperature_K and test Audit mode
          selField.value = 'water_temperature_K';
          selField.dispatchEvent(new Event('change'));
          d.getElementById('btnModeAudit').click();
          const auditHidden = au.hidden;
          const auditWidth = au.width;
          d.getElementById('btnMode3d').click();

          return JSON.stringify({
            embedded: d.documentElement.getAttribute('data-embedded'),
            glWidth: gl.width,
            glHeight: gl.height,
            gates,
            timeLabel5,
            kpiTemp5,
            unavailGlHidden,
            unavailSlHidden,
            chipFieldUnavail,
            auditHidden,
            auditWidth
          });
        })()`);
        assert.strictEqual(poolState.embedded, '1');
        assert.ok(poolState.glWidth > 400 && poolState.glHeight > 350, `Expected sized Pool-Water 3D canvas, got ${poolState.glWidth}x${poolState.glHeight}`);
        assert.strictEqual(poolState.gates.gate0_provenancePreserved, true);
        assert.ok(Math.abs(poolState.gates.gate1_bladeWorthPcm - 18634.71413) < 0.01);
        assert.ok(Math.abs(poolState.gates.gate1_twoPointWorthPcm - 18384.13889) < 0.01);
        assert.ok(Math.abs(poolState.gates.gate1_twoPointWorthSigmaPcm - 84.191196) < 0.001);
        assert.ok(Math.abs(poolState.gates.gate1_kCrossingDay - 340.254042) < 0.001);
        assert.deepStrictEqual(poolState.gates.gate1_latticeCounts, { sfe: 23, cfe: 5, ft: 2, gr: 12, total: 42 });
        assert.strictEqual(poolState.gates.gate2_modulesIndependent, true);
        assert.strictEqual(poolState.gates.gate3_timeStepCount, 6);
        assert.strictEqual(poolState.gates.gate3_gridCellCount, 6144);
        assert.ok(poolState.gates.gate3_maxAbsVelocityDivergence < 1e-9);
        assert.strictEqual(poolState.gates.gate3_plumeWarmsOverTime, true);
        assert.strictEqual(poolState.gates.gate3_missingFieldsRemainUnavailable, true);
        assert.strictEqual(poolState.gates.gate4_pieStageCount, 4);
        assert.strictEqual(poolState.gates.gate4_plannedContrastCells, 15);
        assert.strictEqual(poolState.gates.gate4_fullFactorialCells, 24);
        assert.strictEqual(poolState.gates.gate4_glmmLayerCount, 4);
        assert.strictEqual(poolState.timeLabel5, 't = 600 s');
        assert.strictEqual(poolState.unavailGlHidden, true, '3D canvas must hide when an UNAVAILABLE field is selected');
        assert.strictEqual(poolState.unavailSlHidden, false, '2D canvas must display UNAVAILABLE notice when an UNAVAILABLE field is selected');
        assert.ok(poolState.chipFieldUnavail.includes('UNAVAILABLE'));
        assert.strictEqual(poolState.auditHidden, false);
        assert.ok(poolState.auditWidth > 400);
        console.log(`PASS [6/13]: Pool-Water Interactive 3-D WebGL & Gate 0-4 acceptance suite verified (${poolState.glWidth}x${poolState.glHeight}, 6x7 lattice=42 cells, worth=${poolState.gates.gate1_bladeWorthPcm} pcm, 2M sigma=${poolState.gates.gate1_twoPointWorthSigmaPcm} pcm, max|div u|=${poolState.gates.gate3_maxAbsVelocityDivergence}).`);
        console.log(`PASS [7/13]: Pool-Water explicit UNAVAILABLE field honesty & Audit plotter verified (${poolState.chipFieldUnavail}).`);
        receipt.tests.poolwater_3d_and_gates = poolState.gates;

        // Test 8: Coupled Comparison (Tab 7) rapid tab switching, synchronization gate, and independent state restoration on uncheck while timeline playback is active
        await evalJson(`(() => {
          setView('split');
          setView('pool');
          setView('coupled');
          return 'true';
        })()`);
        await new Promise(r => setTimeout(r, 800));
        const coupledState = await evalJson(`(() => {
          const dPool = document.getElementById('iframePool').contentDocument;
          const dNw = document.getElementById('iframeNw').contentDocument;

          // Configure distinct independent blade positions (Pool=75%, NW=0%) and set timeSlider=3 while playing
          const poolSel = dPool.getElementById('selBlade');
          poolSel.value = '75';
          poolSel.dispatchEvent(new Event('change'));
          const poolTime = dPool.getElementById('timeSlider');
          poolTime.value = '3';
          poolTime.dispatchEvent(new Event('input'));
          dPool.getElementById('btnPlay').click();

          const nwSlider = dNw.getElementById('blade');
          nwSlider.value = '0';
          nwSlider.dispatchEvent(new Event('input'));

          const syncBarVisible = document.getElementById('coupledSyncBar').classList.contains('visible');
          const defaultStatus = document.getElementById('coupledSyncStatus').textContent;
          const chk = document.getElementById('chkSyncBlade');
          const sel = document.getElementById('selCoupledBlade');

          // Check sync and set shared blade to 25%
          chk.checked = true;
          sel.value = '25';
          onCoupledSyncToggle();
          const syncedStatus = document.getElementById('coupledSyncStatus').textContent;
          const poolBladeSynced = poolSel.value;
          const nwBladeSynced = nwSlider.value;
          const nwBladeTxtSynced = dNw.getElementById('bval').textContent;
          const poolTimeDuringSync = poolTime.value;

          // Uncheck sync and verify restoration of pre-sync independent blade states (Pool=75%, NW=0%) and untouched timeSlider
          chk.checked = false;
          onCoupledSyncToggle();
          const restoredStatus = document.getElementById('coupledSyncStatus').textContent;
          const poolBladeRestored = poolSel.value;
          const nwBladeRestored = nwSlider.value;
          const nwBladeTxtRestored = dNw.getElementById('bval').textContent;
          const poolTimeAfterUncheck = poolTime.value;

          // Pause timeline playback
          dPool.getElementById('btnPlay').click();

          return JSON.stringify({
            syncBarVisible,
            defaultStatus,
            syncedStatus,
            poolBladeSynced,
            nwBladeSynced,
            nwBladeTxtSynced,
            poolTimeDuringSync,
            restoredStatus,
            poolBladeRestored,
            nwBladeRestored,
            nwBladeTxtRestored,
            poolTimeAfterUncheck
          });
        })()`);
        assert.strictEqual(coupledState.syncBarVisible, true);
        assert.ok(coupledState.defaultStatus.includes('INDEPENDENT_REFERENCE_PANELS'));
        assert.ok(coupledState.defaultStatus.includes('0..600 s'));
        assert.ok(coupledState.syncedStatus.includes('SHARED_SCENARIO_BLADE_SYNC'));
        assert.ok(coupledState.syncedStatus.includes('INCOMPATIBLE_TIME_BASIS'));
        assert.strictEqual(coupledState.poolBladeSynced, '25');
        assert.strictEqual(coupledState.nwBladeSynced, '25');
        assert.strictEqual(coupledState.nwBladeTxtSynced, '25%');
        assert.strictEqual(coupledState.poolTimeDuringSync, '3');
        assert.ok(coupledState.restoredStatus.includes('INDEPENDENT_REFERENCE_PANELS'));
        assert.strictEqual(coupledState.poolBladeRestored, '75', 'Unchecking #chkSyncBlade must restore Pool pre-sync blade position (75%)');
        assert.strictEqual(coupledState.nwBladeRestored, '0', 'Unchecking #chkSyncBlade must restore Neutron Walk pre-sync blade position (0%)');
        assert.strictEqual(coupledState.nwBladeTxtRestored, '0%');
        assert.strictEqual(coupledState.poolTimeAfterUncheck, '3', 'Blade sync/uncheck must never mutate Pool timeline slider');
        console.log(`PASS [8/13]: Coupled Comparison synchronization gate & uncheck restoration verified (synced=${coupledState.nwBladeTxtSynced}, restored Pool=${coupledState.poolBladeRestored}% / NW=${coupledState.nwBladeTxtRestored}, timeIdx=${coupledState.poolTimeAfterUncheck}).`);
        receipt.tests.coupled_comparison_sync = coupledState;

        // Test 9: Multispecies Biofilm Spatial Model (Synthetic visualization) card, 4-panel Robin cylindrical GIF, 4-mode counterfactual plotter, and narrow mobile viewport (< 500 px) layout
        await evalJson(`(() => { setView('robingif'); return 'true'; })()`);
        await new Promise(r => setTimeout(r, 400));
        const robinCardState = await evalJson(`(() => {
          const card = document.getElementById('multispeciesBiofilmCard');
          const wrap = document.querySelector('.wrap');
          const modeChecks = [];
          for (const [m, btnId] of [['survival', 'btnCfSurv'], ['biomass', 'btnCfBio'], ['displacement', 'btnCfDisp'], ['all', 'btnCfAll']]) {
            setRobinCounterfactualMode(m);
            modeChecks.push(document.getElementById(btnId).classList.contains('blue'));
          }
          // Expand both details drawers and test narrow mobile container width (375 px)
          card.querySelectorAll('details').forEach(d => { d.open = true; });
          const prevMaxWidth = wrap.style.maxWidth;
          wrap.style.maxWidth = '375px';
          const mobileCardClientW = card.clientWidth;
          const mobileCardScrollW = card.scrollWidth;
          wrap.style.maxWidth = prevMaxWidth;
          return JSON.stringify({
            tabActive: document.getElementById('tabRobinGif').classList.contains('active'),
            bannerTxt: document.getElementById('bannerTxt').textContent,
            allFourModesActivated: modeChecks.every(Boolean),
            mobileNoOverflowAt375px: mobileCardScrollW <= mobileCardClientW + 1,
            mobileCardClientW,
            mobileCardScrollW,
            audit: window.verifyRobinBiofilmCardIntegrity()
          });
        })()`);
        assert.strictEqual(robinCardState.tabActive, true);
        assert.ok(robinCardState.bannerTxt.includes('Robin boundary condition'));
        assert.strictEqual(robinCardState.allFourModesActivated, true, 'All 4 counterfactual mode buttons must toggle cleanly');
        assert.strictEqual(robinCardState.mobileNoOverflowAt375px, true, `Expected zero horizontal overflow at 375px width, got scrollWidth=${robinCardState.mobileCardScrollW} vs clientWidth=${robinCardState.mobileCardClientW}`);
        assert.strictEqual(robinCardState.audit.cardPresent, true);
        assert.strictEqual(robinCardState.audit.hasSyntheticBadge, true);
        assert.strictEqual(robinCardState.audit.clarifiesRobinBoundaryCondition, true);
        assert.strictEqual(robinCardState.audit.distinguishesSyntheticDoseRate, true);
        assert.strictEqual(robinCardState.audit.distinguishesNetBiomassProxy, true);
        assert.strictEqual(robinCardState.audit.linksResearchProgram, true);
        assert.strictEqual(robinCardState.audit.linksBiofilmsRepo, true);
        assert.strictEqual(robinCardState.audit.gifLoaded, true, `Expected 800x571 Robin cylindrical GIF to load, got ${robinCardState.audit.gifWidth}x${robinCardState.audit.gifHeight}`);
        assert.strictEqual(robinCardState.audit.clonalRefLoaded, true, 'Expected companion clonal sector reference JPG to load');
        assert.strictEqual(robinCardState.audit.counterfactualCanvasPresent, true);
        assert.strictEqual(robinCardState.audit.noCanvasTextOverflow, true, 'Expected all compact sub-panel titles and footers to fit inside sub-panel width');
        assert.strictEqual(robinCardState.audit.plotsInitSurvRadShift, true);
        assert.strictEqual(robinCardState.audit.noHorizontalCardOverflow, true);
        assert.strictEqual(robinCardState.audit.speciesCount, 7);
        assert.strictEqual(robinCardState.audit.allDisplacementCisSpanZero, true);
        console.log(`PASS [9/13]: Multispecies Biofilm Spatial Model (Synthetic visualization) card, 4-panel Robin cylindrical GIF (${robinCardState.audit.gifWidth}x${robinCardState.audit.gifHeight}), 3-outcome counterfactual plotter, & 375px mobile layout verified.`);
        receipt.tests.multispecies_biofilm_robin_gif_card = robinCardState.audit;

        // Test 10: Biotite, Biomagnetite & Cryptochrome 4D Magnetoreception Viewer (Tab 10) WebGL, EG-1..EG-4, 4D Hyperplane Scrubber, and 1920x1080 PNG Export
        await evalJson(`(() => { setView('magneto'); return 'true'; })()`);
        await new Promise(r => setTimeout(r, 1500));
        const magnetoState = await evalJson(`(() => {
          const ifr = document.getElementById('iframeMagneto');
          const d = ifr.contentDocument;
          const w = ifr.contentWindow;
          const gl = d.getElementById('glField');
          const fb = d.getElementById('canvas2d');
          const gates4dInit = w.verifyBiotite4dMagnetoreceptionGates();
          const walkGates = w.verifyBiomagneticWalkIntegrity();

          // Probe all 7 biotite inclusion regimes in #selBiotiteRegime
          const selReg = d.getElementById('selBiotiteRegime');
          const regimeAudit = {};
          for (const opt of Array.from(selReg.options)) {
            selReg.value = opt.value;
            selReg.dispatchEvent(new Event('change'));
            const g = w.verifyBiotite4dMagnetoreceptionGates();
            regimeAudit[opt.value] = {
              umag: g.hyperplane_4d_state.activeBiotiteUmagOverKbt,
              criterialClass: g.hyperplane_4d_state.activeBiotiteCriterialClass,
              lblUmag: d.getElementById('lblBiotiteUmag').textContent
            };
          }

          // Probe all 8 D_4 group actions in #selD4Action
          const selD4 = d.getElementById('selD4Action');
          const d4Audit = {};
          for (const opt of Array.from(selD4.options)) {
            selD4.value = opt.value;
            selD4.dispatchEvent(new Event('change'));
            const g = w.verifyBiotite4dMagnetoreceptionGates();
            d4Audit[opt.value] = {
              v0: g.hyperplane_4d_state.projectedV0,
              lblD4: d.getElementById('lblD4Action').textContent
            };
          }

          // Probe non-15-multiple w-angle (45 deg), boundary w-angle (360 deg), and extreme (-90, +90) hyperplane rotations
          const slW = d.getElementById('slider4dW');
          const slXW = d.getElementById('sliderXW');
          const slYW = d.getElementById('sliderYW');
          const slZW = d.getElementById('sliderZW');
          slW.value = '45';
          slW.dispatchEvent(new Event('input'));
          const w45Val = Number(slW.value);
          slW.value = '360';
          slW.dispatchEvent(new Event('input'));
          slXW.value = '-90';
          slXW.dispatchEvent(new Event('input'));
          slYW.value = '90';
          slYW.dispatchEvent(new Event('input'));
          slZW.value = '-90';
          slZW.dispatchEvent(new Event('input'));
          const lblHyperBoundary = d.getElementById('lblHyperRot').textContent;

          // Test pointer drag rotation and wheel zoom on #glField
          const camBefore = w.verifyBiotite4dMagnetoreceptionGates().hyperplane_4d_state.camera;
          gl.dispatchEvent(new w.PointerEvent('pointerdown', { clientX: 200, clientY: 200, pointerId: 1, bubbles: true }));
          gl.dispatchEvent(new w.PointerEvent('pointermove', { clientX: 250, clientY: 160, pointerId: 1, bubbles: true }));
          gl.dispatchEvent(new w.PointerEvent('pointerup', { clientX: 250, clientY: 160, pointerId: 1, bubbles: true }));
          gl.dispatchEvent(new w.WheelEvent('wheel', { deltaY: -120, bubbles: true, cancelable: true }));
          const camAfter = w.verifyBiotite4dMagnetoreceptionGates().hyperplane_4d_state.camera;
          // Restore initial camera state (yaw=0.55, pitch=0.38, zoom=1.0)
          gl.dispatchEvent(new w.PointerEvent('pointerdown', { clientX: 250, clientY: 160, pointerId: 1, bubbles: true }));
          gl.dispatchEvent(new w.PointerEvent('pointermove', { clientX: 200, clientY: 200, pointerId: 1, bubbles: true }));
          gl.dispatchEvent(new w.PointerEvent('pointerup', { clientX: 200, clientY: 200, pointerId: 1, bubbles: true }));
          gl.dispatchEvent(new w.WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true }));

          // Test dynamic responsive resizing across <375px mobile (350px) and >1920px desktop (1960px)
          const origIfrWidth = ifr.style.width;
          ifr.style.width = '350px';
          w.dispatchEvent(new Event('resize'));
          const mobileGlWidth = gl.width;
          const mobileOverflow = d.documentElement.scrollWidth - d.documentElement.clientWidth;
          ifr.style.width = '1960px';
          w.dispatchEvent(new Event('resize'));
          const desktopGlWidth = gl.width;
          const desktopOverflow = d.documentElement.scrollWidth - d.documentElement.clientWidth;
          ifr.style.width = origIfrWidth;
          w.dispatchEvent(new Event('resize'));

          // Scrub to 240 deg, r270, scenario_b_nrm_1pct for steady state
          slW.value = '240';
          slW.dispatchEvent(new Event('input'));
          slXW.value = '25';
          slXW.dispatchEvent(new Event('input'));
          slYW.value = '15';
          slYW.dispatchEvent(new Event('input'));
          slZW.value = '0';
          slZW.dispatchEvent(new Event('input'));
          selD4.value = 'r270';
          selD4.dispatchEvent(new Event('change'));
          selReg.value = 'scenario_b_nrm_1pct';
          selReg.dispatchEvent(new Event('change'));
          const gates4d = w.verifyBiotite4dMagnetoreceptionGates();
          const syncReadout = d.getElementById('readout4dSynchronized').textContent;

          return JSON.stringify({
            tabActive: document.getElementById('tabMagneto').classList.contains('active'),
            embedded: d.documentElement.getAttribute('data-embedded'),
            glWidth: gl.width,
            glHeight: gl.height,
            glHidden: gl.hidden,
            fbHidden: fb.hidden,
            gates4dInit,
            gates4d,
            walkGates,
            regimeAudit,
            d4Audit,
            w45Val,
            lblHyperBoundary,
            syncReadout,
            camBefore,
            camAfter,
            mobileGlWidth,
            mobileOverflow,
            desktopGlWidth,
            desktopOverflow
          });
        })()`);
        assert.strictEqual(magnetoState.tabActive, true);
        assert.strictEqual(magnetoState.embedded, '1');
        assert.strictEqual(magnetoState.glHidden, false);
        assert.ok(magnetoState.glWidth > 400 && magnetoState.glHeight > 350, `Expected sized Biotite 4D WebGL canvas, got ${magnetoState.glWidth}x${magnetoState.glHeight}`);
        assert.strictEqual(magnetoState.gates4d.section_version, '1.3.0');
        assert.deepStrictEqual(magnetoState.gates4d.gate_ids, ['EG-1', 'EG-2', 'EG-3', 'EG-4']);
        assert.strictEqual(magnetoState.gates4d.oklo_reactor_zone_biotite_verified, false);
        assert.strictEqual(magnetoState.gates4d.biological_sensing_established_by_calculation, false);
        assert.strictEqual(magnetoState.gates4d.all_scenarios_realistic_default_false, true);
        assert.strictEqual(magnetoState.gates4d.directional_torque_requires_anisotropy, true);
        assert.strictEqual(magnetoState.gates4d.isotropic_b2_generates_torque, false);
        assert.strictEqual(magnetoState.gates4d.biotite_table_rows, 6);
        assert.strictEqual(magnetoState.gates4d.biotite_table_col_match, true, 'Expected all rows in #biotiteInclusionTable to have 6 <td> cells matching the 6 <th> columns');
        assert.strictEqual(magnetoState.gates4d.criterial_colors.accepted_verified, '#22c55e');
        assert.strictEqual(magnetoState.gates4d.criterial_colors.criterial_pruned, '#ef4444');
        assert.strictEqual(magnetoState.w45Val, 45, 'Expected #slider4dW to accept non-15-multiple angle 45 without quantization');
        assert.strictEqual(magnetoState.lblHyperBoundary, '-90 / 90 / -90 deg');
        assert.ok(magnetoState.camAfter.yaw < magnetoState.camBefore.yaw, 'Expected pointer drag to update camera yaw');
        assert.ok(magnetoState.camAfter.pitch < magnetoState.camBefore.pitch, 'Expected pointer drag to update camera pitch');
        assert.ok(magnetoState.camAfter.zoom > magnetoState.camBefore.zoom, 'Expected wheel scroll to update camera zoom');
        assert.ok(magnetoState.mobileGlWidth < magnetoState.desktopGlWidth, `Expected dynamic resize from 350px (${magnetoState.mobileGlWidth}px) to 1960px (${magnetoState.desktopGlWidth}px)`);
        assert.ok(magnetoState.mobileOverflow <= 1, `Expected zero page-level horizontal overflow at <375px (350px), got ${magnetoState.mobileOverflow}`);
        assert.ok(magnetoState.desktopOverflow <= 1, `Expected zero page-level horizontal overflow at >1920px (1960px), got ${magnetoState.desktopOverflow}`);
        // Verify all 7 regimes produce distinct, accurate SI values
        assert.ok(Math.abs(magnetoState.regimeAudit.scenario_b_nrm.umag - 0.005854412) < 1e-8);
        assert.ok(Math.abs(magnetoState.regimeAudit.scenario_b_nrm_1pct.umag - 0.579497) < 1e-6);
        assert.ok(Math.abs(magnetoState.regimeAudit.scenario_a_sat.umag - 0.579497) < 1e-6);
        assert.ok(Math.abs(magnetoState.regimeAudit.scenario_a_sat_1pct.umag - 57.943805) < 1e-5);
        assert.strictEqual(magnetoState.regimeAudit.scenario_a_sat_1pct.criterialClass, 'exploratory');
        assert.ok(Math.abs(magnetoState.regimeAudit.scenario_c_aniso.umag - 0.00126023) < 1e-8);
        assert.ok(Math.abs(magnetoState.regimeAudit.scenario_c_iso.umag - 0.007264183) < 1e-8);
        assert.ok(Math.abs(magnetoState.regimeAudit.pure_paramag.umag - 5.894344e-8) < 1e-13);
        // Verify D_4 reflections transform projectedV0=(-1,-1,-1,-1) (sx, sy, sd2 move v0; sd1 fixes x=z diagonal and updates lblD4)
        assert.notDeepStrictEqual(magnetoState.d4Audit.sx.v0, magnetoState.d4Audit.e.v0, 'Expected D_4 reflection sx to transform 4D vertex v0');
        assert.notDeepStrictEqual(magnetoState.d4Audit.sy.v0, magnetoState.d4Audit.e.v0, 'Expected D_4 reflection sy to transform 4D vertex v0');
        assert.deepStrictEqual(magnetoState.d4Audit.sd1.v0, magnetoState.d4Audit.e.v0, 'Expected D_4 diagonal reflection sd1 (x<->z) to fix diagonal vertex v0=(-1,-1,-1,-1)');
        assert.strictEqual(magnetoState.d4Audit.sd1.lblD4, 's_d1 (+45 Diag)');
        assert.notDeepStrictEqual(magnetoState.d4Audit.sd2.v0, magnetoState.d4Audit.e.v0, 'Expected D_4 reflection sd2 to transform 4D vertex v0');
        assert.strictEqual(magnetoState.walkGates.total_parcels, 10752);
        assert.strictEqual(magnetoState.walkGates.species_count, 7);
        assert.strictEqual(magnetoState.walkGates.all_displacement_cis_span_zero, true);
        assert.strictEqual(magnetoState.walkGates.all_survivor_radius_decompositions_exact, true);
        assert.strictEqual(magnetoState.walkGates.has_matched_connectivity_control, true);
        assert.strictEqual(magnetoState.walkGates.planned_contrast_cells, 15);
        assert.strictEqual(magnetoState.walkGates.full_crossed_factorial_cells, 24);
        assert.ok(magnetoState.syncReadout.includes('240') && magnetoState.syncReadout.includes('r270') && magnetoState.syncReadout.includes('5.7950e-1'));

        // Rapidly switch between setView('magneto'), setView('coupled'), and setView('robingif') and export PNG across all 3 render modes
        const multiModeExportRes = await evalJson(`(async () => {
          setView('coupled');
          setView('robingif');
          setView('magneto');
          const d = document.getElementById('iframeMagneto').contentDocument;
          const w = document.getElementById('iframeMagneto').contentWindow;
          const modes = [
            { mode: '3d', btn: 'btnRender3d' },
            { mode: '2d', btn: 'btnRender2d' },
            { mode: 'biomag_walk', btn: 'btnRenderBiomagWalk' }
          ];
          const results = {};
          for (const m of modes) {
            d.getElementById(m.btn).click();
            results[m.mode] = await w.exportMagnetoreception4dPng();
          }
          d.getElementById('btnRender3d').click();
          return JSON.stringify(results);
        })()`);
        for (const modeKey of ['3d', '2d', 'biomag_walk']) {
          const res = multiModeExportRes[modeKey];
          assert.strictEqual(res.width, 1920);
          assert.strictEqual(res.height, 1080);
          assert.ok(res.dataUrlLength > 50000, `Expected non-empty 1920x1080 PNG data URL in mode ${modeKey}, got length ${res.dataUrlLength}`);
          assert.strictEqual(res.hasEmDash, false, `Expected zero em-dashes in mode ${modeKey}`);
          assert.strictEqual(res.hasEnDash, false, `Expected zero en-dashes in mode ${modeKey}`);
        }
        const pngExportRes = multiModeExportRes['3d'];
        console.log(`PASS [10/15]: Biotite, Biomagnetite & Cryptochrome 4D Magnetoreception Viewer WebGL (${magnetoState.glWidth}x${magnetoState.glHeight}), EG-1..EG-4, 7-regime & 8-element D_4 4D scrubber, & 3-mode 1920x1080 PNG export verified.`);
        receipt.tests.biotite_magnetoreception_4d_viewer = {
          glWidth: magnetoState.glWidth,
          glHeight: magnetoState.glHeight,
          gates4d: magnetoState.gates4d,
          walkGates: magnetoState.walkGates,
          pngExport: pngExportRes,
          multiModeExport: multiModeExportRes
        };

        // Test 11: Tab 11 Coordinated 3D Pool-and-Biofilm Explorer (reactor_pool_biofilm_explorer.html)
        await evalJson(`(() => { setView('poolbiofilm'); return 'true'; })()`);
        await new Promise(r => setTimeout(r, 2000));
        const poolBiofilmState = await evalJson(`(() => {
          const ifr = document.getElementById('iframePoolBiofilm');
          const d = ifr.contentDocument;
          const w = ifr.contentWindow;
          const glPool = d.getElementById('glPoolCanvas');
          const cPool2d = d.getElementById('canvasPool2d');
          const glBio = d.getElementById('glBiofilmCanvas');
          const cBio2d = d.getElementById('canvasBiofilm2d');
          const cRows = d.getElementById('canvasBiofilmRows');
          const api = w.__POOL_BIOFILM_EXPLORER__;
          const st = w.EXPLORER_STATE;

          const defaultLambdaEtc = st.lambda_etc;
          const defaultSolversSeparate = st.solvers_kept_separate;
          const defaultCoupledClaimed = st.solver_level_coupled_validation_claimed;
          const defaultSecondsPerMcsIsNaN = Number.isNaN(st.seconds_per_mcs);
          const renderModeMacro = st.render_mode_macro;
          const renderModeMicro = st.render_mode_micro;
          const webglContextCreated = st.webgl_context_created;
          const fallbackTriggered = st.fallback_triggered;
          const boundaryCheck = api.verifyScientificBoundaries();
          const stateFromHook = api.getState();

          // Exercise all 4 spatial layer toggles via api.setLayerToggle
          const layerKeys = ['pool_geometry', 'temperature_flow', 'radiation_radiolysis', 'biofilm_coupons'];
          const layerToggleAudit = {};
          for (const lk of layerKeys) {
            api.setLayerToggle(lk, false);
            const offVal = st.layers[lk];
            api.setLayerToggle(lk, true);
            const onVal = st.layers[lk];
            layerToggleAudit[lk] = { offVal, onVal };
          }

          // Edge case: all 4 layers off + UNAVAILABLE field selected simultaneously (must not throw)
          for (const lk of layerKeys) api.setLayerToggle(lk, false);
          w.setActiveField('validated_cfd_pressure_Pa');
          const allOffUnavailableClassification = d.getElementById('prov_data_classification').textContent;
          for (const lk of layerKeys) api.setLayerToggle(lk, true);
          w.setActiveField('H2O2');

          // Exercise camera presets & full slice ranges (-200..200 cm, 0..100 um)
          const camPresets = ['Wedge Cutaway', 'Orbit', 'Isometric', 'Top Core', 'Coupon Micro-Zoom'];
          const camAudit = {};
          for (const cpName of camPresets) {
            const cRes = w.setCameraView(cpName);
            camAudit[cpName] = Boolean(cRes && st.camera_preset === cpName);
          }
          w.setCameraView('Wedge Cutaway');
          w.setBiofilmDepthRange(100);
          w.setCutawayGeometry(120, -200, 85.0);
          const rangeTestAt100 = {
            theta: st.theta_wedge_deg,
            zSliceCm: st.z_slice_cm,
            zBioUm: st.z_biofilm_um,
            depthRange: st.biofilm_depth_range_um
          };
          w.setBiofilmDepthRange(30);
          w.setCutawayGeometry(90, -40, 12.0);

          // Exercise all 4 morphotypes (SL, SS, LL, CPM-Hypha) via api.setMorphotype
          const morphKeys = ['SL', 'SS', 'LL', 'CPM-Hypha'];
          const morphAudit = {};
          for (const mk of morphKeys) {
            const m = api.setMorphotype(mk);
            morphAudit[mk] = {
              active: st.morphotype === mk,
              z_mean_blue_um: m.z_mean_blue_um,
              z_mean_red_um: m.z_mean_red_um,
              stratified_canopy_over_base: m.stratified_canopy_over_base,
              badgeText: d.getElementById('microMorphBadge').textContent
            };
          }
          api.setMorphotype('SL');

          // Exercise uncoupled time sliders (macro pool time [s] vs micro CPM step [MCS])
          const macroRes = w.setMacroPoolTime(2400);
          const macroAt2400 = {
            t_pool_s: st.t_pool_s,
            mcs_step: st.mcs_step,
            mcs_step_unchanged: macroRes.mcs_step_unchanged,
            tPoolLabel: d.getElementById('lbl_t_pool_s').textContent
          };
          const microRes = w.setMicroMcsStep(120);
          const microAt120 = {
            t_pool_s: st.t_pool_s,
            mcs_step: st.mcs_step,
            t_pool_s_unchanged: microRes.t_pool_s_unchanged,
            mcsLabel: d.getElementById('lbl_mcs_step').textContent,
            secondsPerMcsIsNaN: Number.isNaN(st.seconds_per_mcs)
          };
          w.setMacroPoolTime(1800);
          w.setMicroMcsStep(60);

          // Exercise all 7 null-model comparisons and both equal-dose schedule regimes via api
          const nullKeys = [
            'baseline_no_coupling_default',
            'five_way_radionuclide_retention',
            'equal_dose_power_schedules',
            'control_5a_spatial_bias_null',
            'control_5b_biochemical_magnetic_sensitivity',
            'control_6_oxidant_chemotropism',
            'epistemic_gates_eg1_eg4_and_links_l1_l5'
          ];
          const nullAudit = {};
          for (const nk of nullKeys) {
            const rec = api.setNullControl(nk);
            nullAudit[nk] = {
              active: st.active_null_control === nk,
              hasRecord: Boolean(rec && rec.id === nk),
              readoutLen: d.getElementById('nullWorkbenchReadout').textContent.length
            };
          }
          api.setScheduleRegime('conserved_linear_uncoupled');
          const linearRegimeActive = st.schedule_regime === 'conserved_linear_uncoupled';
          api.setScheduleRegime('active_nonlinear_coupled');
          const nonlinearRegimeActive = st.schedule_regime === 'active_nonlinear_coupled';
          api.setNullControl('baseline_no_coupling_default');

          // Exercise Provenance on Demand across fields via api.selectProvenanceField and api.getProvenanceRecord
          const provKeys = ['pool_geometry', 'H2O2', 'temperature_C', 'coupon_eps_sorption', 'cpm_morphology_stage3', 'coccomyxa_actinabiotis_benchmark', 'control_5b_rpm_sensitivity', 'validated_cfd_pressure_Pa'];
          const provAudit = {};
          for (const pk of provKeys) {
            api.selectProvenanceField(pk);
            const recObj = api.getProvenanceRecord(pk);
            provAudit[pk] = {
              fieldId: d.getElementById('prov_field_id').textContent,
              label: d.getElementById('prov_label').textContent,
              hasLabelInRecord: Boolean(recObj && recObj.label && recObj.label.length > 3),
              geometryClassification: d.getElementById('prov_geometry_classification').textContent,
              evidenceClassification: d.getElementById('prov_evidence_classification').textContent,
              epistemicClass: d.getElementById('prov_epistemic_class').textContent,
              epistemicStatus: d.getElementById('prov_epistemic_status').textContent,
              classification: d.getElementById('prov_data_classification').textContent,
              outputClassification: recObj ? (recObj.output_classification || null) : null,
              commitLock: d.getElementById('prov_commit_lock').textContent
            };
          }
          api.selectProvenanceField('H2O2');

          const allowedClasses = ['SYNTHETIC_SCHEMATIC', 'SYNTHETIC', 'CALCULATED', 'PROVISIONAL_ASSUMPTION', 'UNAVAILABLE'];
          const allowedGeometryClasses = ['SYNTHETIC_SCHEMATIC', 'MICRO_BIOFILM_SLAB_VOXEL'];
          const allowedEvidenceClasses = ['synthetic', 'calculated', 'uncalibrated_model_snapshot', 'unavailable'];
          const allProvenanceClassesValid = Object.values(api.provenance_registry).every(
            r => r &&
              allowedClasses.includes(r.data_classification) &&
              allowedClasses.includes(r.epistemic_class) &&
              allowedGeometryClasses.includes(r.geometry_classification) &&
              allowedEvidenceClasses.includes(r.evidence_classification) &&
              typeof r.epistemic_status === 'string' && r.epistemic_status.length > 10
          );
          const shorthandAliasesValid = ['H2O2_uM', 'H2_uM', 'OH_rad_nM', 'e_aq_nM', 'dose_rate_Gy_h', 'boundary_layer_um', 'C1', 'C2', 'C3', 'H0_baseline_lambda0', 'H0_1_sterile_abiotic', 'H0_2_dead_biomass', 'H0_3_non_melanized', 'H0_5b_rpm_sensitivity', 'H0_6_chemotropism', 'H0_equal_dose_schedules', 'H0_epistemic_gates'].every(
            k => Boolean(api.provenance_registry[k] && allowedEvidenceClasses.includes(api.provenance_registry[k].evidence_classification))
          );
          const geomProv = st.geometry_provenance || {};

          // Gate 3: Programmatic lambda_etc = 0.0 under null controls & timeline firewall probe
          const firewallProbe = api.attemptCrossTimelineOrBaselineViolation();
          const couplingAttemptRes = api.attemptTimelineCoupling(12.5);
          const enforceFirewallRes = api.enforceBaselineAndTimelineFirewall();
          api.setLambdaEtc(0.5);
          const exploratoryTransition = {
            lambdaAt05: st.lambda_etc,
            controlAt05: st.active_null_control
          };
          api.setNullControl('H0_baseline_lambda0');
          const resetUnderNull = {
            lambdaAfterNull: st.lambda_etc,
            lockActive: st.baseline_lambda_lock
          };
          api.setLambdaEtc(0.75, { enforceBaselineLock: true });
          const clampedWithLockOption = st.lambda_etc;
          api.setNullControl('baseline_no_coupling_default');

          // Sample canvas pixels to prove non-blank rendering on all 2D/overlay canvases
          function countNonBlankPixels(cnv) {
            const ctx2 = cnv.getContext('2d');
            const img = ctx2.getImageData(0, 0, cnv.width, cnv.height).data;
            let nonBlank = 0;
            for (let i = 0; i < img.length; i += 160) {
              if (img[i] > 10 || img[i + 1] > 15 || img[i + 2] > 25) nonBlank++;
            }
            return nonBlank;
          }
          const poolPixelsNonBlank = countNonBlankPixels(cPool2d);
          const bioPixelsNonBlank = countNonBlankPixels(cBio2d);
          const rowsPixelsNonBlank = countNonBlankPixels(cRows);

          return JSON.stringify({
            tabActive: document.getElementById('tabPoolBiofilm').classList.contains('active'),
            artifactId: stateFromHook.artifact_id,
            boundaryAllPassed: boundaryCheck.all_passed,
            provenanceTaxonomySeparated: boundaryCheck.provenanceTaxonomySeparated,
            passingRenderingTestsValidateSoftwareBoundariesNotPhysicalModel: boundaryCheck.passingRenderingTestsValidateSoftwareBoundariesNotPhysicalModel,
            empiricalPhysicalOrBiologicalValidationClaimed: boundaryCheck.empiricalPhysicalOrBiologicalValidationClaimed,
            timelineCouplingProgrammaticallyBlocked: boundaryCheck.timelineCouplingProgrammaticallyBlocked,
            baselineNullControlEnforcesLambdaZero: boundaryCheck.baselineNullControlEnforcesLambdaZero,
            syntheticSchematicCheckSnake: boundaryCheck.checks.synthetic_schematic_not_tecdoc643_geometry,
            syntheticSchematicCheckCamel: boundaryCheck.checks.syntheticSchematicNotTecdoc643Geometry,
            geomClassification: geomProv.geometry_classification,
            isTecdoc643BenchmarkGeometry: geomProv.is_tecdoc643_benchmark_geometry,
            allProvenanceClassesValid,
            shorthandAliasesValid,
            firewallProbeAllBlocked: firewallProbe.all_violations_blocked,
            firewallRawPropertyTamperBlocked: firewallProbe.raw_property_tamper_blocked_immediately,
            couplingAttemptRes,
            enforceFirewallRes,
            exploratoryTransition,
            resetUnderNull,
            clampedWithLockOption,
            webglContextCreated,
            fallbackTriggered,
            glPoolWidth: glPool.width,
            glPoolHeight: glPool.height,
            cPool2dWidth: cPool2d.width,
            cPool2dHeight: cPool2d.height,
            glBioWidth: glBio.width,
            glBioHeight: glBio.height,
            cBio2dWidth: cBio2d.width,
            cBio2dHeight: cBio2d.height,
            cRowsWidth: cRows.width,
            cRowsHeight: cRows.height,
            poolPixelsNonBlank,
            bioPixelsNonBlank,
            rowsPixelsNonBlank,
            renderModeMacro,
            renderModeMicro,
            defaultLambdaEtc,
            defaultSolversSeparate,
            defaultCoupledClaimed,
            defaultSecondsPerMcsIsNaN,
            morphotypesCount: morphKeys.filter(k => Boolean(api.morphotype_data[k])).length,
            nullControlsCount: Object.keys(api.null_model_workbench).length,
            equalDosePrimaryIdentical: api.null_model_workbench.equal_dose_power_schedules.primary_yields_identical_across_schedules,
            equalDoseRegimeDependent: api.null_model_workbench.equal_dose_power_schedules.downstream_differences_are_regime_dependent,
            conservedRegimeIdentical: api.null_model_workbench.equal_dose_power_schedules.conserved_regime_final_yields_identical,
            layerToggleAudit,
            allOffUnavailableClassification,
            camAudit,
            rangeTestAt100,
            morphAudit,
            macroAt2400,
            microAt120,
            nullAudit,
            linearRegimeActive,
            nonlinearRegimeActive,
            provAudit
          });
        })()`);
        assert.strictEqual(poolBiofilmState.tabActive, true);
        assert.strictEqual(poolBiofilmState.artifactId, 'REACTOR-POOL-BIOFILM-COORDINATED-3D-01');
        assert.strictEqual(poolBiofilmState.boundaryAllPassed, true);
        assert.strictEqual(poolBiofilmState.provenanceTaxonomySeparated, true);
        assert.strictEqual(poolBiofilmState.passingRenderingTestsValidateSoftwareBoundariesNotPhysicalModel, true);
        assert.strictEqual(poolBiofilmState.empiricalPhysicalOrBiologicalValidationClaimed, false);
        assert.strictEqual(poolBiofilmState.timelineCouplingProgrammaticallyBlocked, true);
        assert.strictEqual(poolBiofilmState.baselineNullControlEnforcesLambdaZero, true);
        assert.strictEqual(poolBiofilmState.syntheticSchematicCheckSnake, true);
        assert.strictEqual(poolBiofilmState.syntheticSchematicCheckCamel, true);
        assert.strictEqual(poolBiofilmState.geomClassification, 'SYNTHETIC_SCHEMATIC');
        assert.strictEqual(poolBiofilmState.isTecdoc643BenchmarkGeometry, false);
        assert.strictEqual(poolBiofilmState.allProvenanceClassesValid, true);
        assert.strictEqual(poolBiofilmState.shorthandAliasesValid, true);
        assert.strictEqual(poolBiofilmState.firewallProbeAllBlocked, true);
        assert.strictEqual(poolBiofilmState.firewallRawPropertyTamperBlocked, true);
        assert.strictEqual(poolBiofilmState.couplingAttemptRes.timeline_coupling_rejected, true);
        assert.strictEqual(poolBiofilmState.couplingAttemptRes.reason, 'NO_VALIDATED_SECONDS_TO_MCS_CONVERSION');
        assert.strictEqual(poolBiofilmState.couplingAttemptRes.baseline_lambda_etc_enforced_zero, true);
        assert.strictEqual(poolBiofilmState.couplingAttemptRes.rendering_tests_validate_physical_model, false);
        assert.strictEqual(poolBiofilmState.enforceFirewallRes.timeline_coupling_rejected, true);
        assert.strictEqual(poolBiofilmState.enforceFirewallRes.reason, 'NO_VALIDATED_SECONDS_TO_MCS_CONVERSION');
        assert.strictEqual(poolBiofilmState.enforceFirewallRes.baseline_lambda_etc_enforced_zero, true);
        assert.strictEqual(poolBiofilmState.enforceFirewallRes.rendering_tests_validate_physical_model, false);
        assert.strictEqual(poolBiofilmState.exploratoryTransition.lambdaAt05, 0.5);
        assert.strictEqual(poolBiofilmState.exploratoryTransition.controlAt05, 'EXPLORATORY_COUPLED_HYPOTHESIS');
        assert.strictEqual(poolBiofilmState.resetUnderNull.lambdaAfterNull, 0.0);
        assert.strictEqual(poolBiofilmState.resetUnderNull.lockActive, true);
        assert.strictEqual(poolBiofilmState.clampedWithLockOption, 0.0);
        assert.strictEqual(poolBiofilmState.webglContextCreated, true);
        assert.strictEqual(poolBiofilmState.fallbackTriggered, false);
        assert.strictEqual(poolBiofilmState.renderModeMacro, 'webgl+2d_overlay');
        assert.strictEqual(poolBiofilmState.renderModeMicro, 'webgl+2d_overlay');
        assert.ok(poolBiofilmState.glPoolWidth > 350 && poolBiofilmState.glPoolHeight > 280, `Expected sized Pool 3D WebGL canvas, got ${poolBiofilmState.glPoolWidth}x${poolBiofilmState.glPoolHeight}`);
        assert.ok(poolBiofilmState.glBioWidth > 350 && poolBiofilmState.glBioHeight > 240, `Expected sized Biofilm 3D WebGL canvas, got ${poolBiofilmState.glBioWidth}x${poolBiofilmState.glBioHeight}`);
        assert.ok(poolBiofilmState.cRowsWidth > 350 && poolBiofilmState.cRowsHeight > 200, `Expected sized Row A/B/C canvas, got ${poolBiofilmState.cRowsWidth}x${poolBiofilmState.cRowsHeight}`);
        assert.ok(poolBiofilmState.poolPixelsNonBlank > 50, 'Expected non-blank pixels on Macro Pool canvas');
        assert.ok(poolBiofilmState.bioPixelsNonBlank > 50, 'Expected non-blank pixels on Micro Biofilm canvas');
        assert.ok(poolBiofilmState.rowsPixelsNonBlank > 50, 'Expected non-blank pixels on Row A/B/C Stratification canvas');
        assert.strictEqual(poolBiofilmState.defaultLambdaEtc, 0.0, 'Melanin-mediated radiotrophy coupling lambda_etc must default to 0.0');
        assert.strictEqual(poolBiofilmState.defaultSolversSeparate, true, 'Solvers must remain strictly separate at the solver level');
        assert.strictEqual(poolBiofilmState.defaultCoupledClaimed, false, 'Must never claim solver-level coupled validation');
        assert.strictEqual(poolBiofilmState.defaultSecondsPerMcsIsNaN, true, 'seconds_per_mcs must be NaN (never convert t_pool [s] to MCS)');
        assert.strictEqual(poolBiofilmState.allOffUnavailableClassification, 'UNAVAILABLE');
        for (const cpName of ['Wedge Cutaway', 'Orbit', 'Isometric', 'Top Core', 'Coupon Micro-Zoom']) {
          assert.strictEqual(poolBiofilmState.camAudit[cpName], true, `Camera preset ${cpName} failed`);
        }
        assert.strictEqual(poolBiofilmState.rangeTestAt100.zSliceCm, -200);
        assert.strictEqual(poolBiofilmState.rangeTestAt100.zBioUm, 85.0);
        assert.strictEqual(poolBiofilmState.rangeTestAt100.depthRange, 100);
        assert.strictEqual(poolBiofilmState.morphotypesCount, 4);
        assert.strictEqual(poolBiofilmState.nullControlsCount, 7);
        assert.strictEqual(poolBiofilmState.equalDosePrimaryIdentical, true);
        assert.strictEqual(poolBiofilmState.equalDoseRegimeDependent, true);
        assert.strictEqual(poolBiofilmState.conservedRegimeIdentical, true);
        assert.ok(poolBiofilmState.morphAudit.SL.z_mean_blue_um < poolBiofilmState.morphAudit.SL.z_mean_red_um, 'Expected SL morphotype blue cell height < red cell height');
        assert.strictEqual(poolBiofilmState.morphAudit.SL.stratified_canopy_over_base, true);
        assert.strictEqual(poolBiofilmState.morphAudit.SS.stratified_canopy_over_base, false);
        assert.strictEqual(poolBiofilmState.morphAudit.LL.stratified_canopy_over_base, false);
        assert.strictEqual(poolBiofilmState.morphAudit['CPM-Hypha'].stratified_canopy_over_base, true);
        assert.strictEqual(poolBiofilmState.macroAt2400.t_pool_s, 2400);
        assert.strictEqual(poolBiofilmState.macroAt2400.mcs_step, 60, 'Changing macro pool time [s] must not alter micro MCS step');
        assert.strictEqual(poolBiofilmState.macroAt2400.mcs_step_unchanged, true);
        assert.strictEqual(poolBiofilmState.microAt120.t_pool_s, 2400, 'Changing micro MCS step must not alter macro pool time [s]');
        assert.strictEqual(poolBiofilmState.microAt120.mcs_step, 120);
        assert.strictEqual(poolBiofilmState.microAt120.t_pool_s_unchanged, true);
        assert.strictEqual(poolBiofilmState.microAt120.secondsPerMcsIsNaN, true);
        assert.strictEqual(poolBiofilmState.linearRegimeActive, true);
        assert.strictEqual(poolBiofilmState.nonlinearRegimeActive, true);
        for (const nk of Object.keys(poolBiofilmState.nullAudit)) {
          assert.strictEqual(poolBiofilmState.nullAudit[nk].active, true);
          assert.strictEqual(poolBiofilmState.nullAudit[nk].hasRecord, true);
          assert.ok(poolBiofilmState.nullAudit[nk].readoutLen > 50, `Expected populated readout for null control ${nk}`);
        }
        for (const pk of Object.keys(poolBiofilmState.provAudit)) {
          assert.strictEqual(poolBiofilmState.provAudit[pk].hasLabelInRecord, true, `Provenance record ${pk} missing label`);
        }
        assert.strictEqual(poolBiofilmState.provAudit.pool_geometry.geometryClassification, 'SYNTHETIC_SCHEMATIC');
        assert.strictEqual(poolBiofilmState.provAudit.pool_geometry.evidenceClassification, 'synthetic');
        assert.strictEqual(poolBiofilmState.provAudit.pool_geometry.classification, 'SYNTHETIC_SCHEMATIC');
        assert.strictEqual(poolBiofilmState.provAudit.H2O2.geometryClassification, 'SYNTHETIC_SCHEMATIC');
        assert.strictEqual(poolBiofilmState.provAudit.H2O2.evidenceClassification, 'calculated');
        assert.strictEqual(poolBiofilmState.provAudit.cpm_morphology_stage3.geometryClassification, 'MICRO_BIOFILM_SLAB_VOXEL');
        assert.strictEqual(poolBiofilmState.provAudit.cpm_morphology_stage3.evidenceClassification, 'uncalibrated_model_snapshot');
        assert.strictEqual(poolBiofilmState.provAudit.validated_cfd_pressure_Pa.geometryClassification, 'SYNTHETIC_SCHEMATIC');
        assert.strictEqual(poolBiofilmState.provAudit.validated_cfd_pressure_Pa.evidenceClassification, 'unavailable');
        assert.strictEqual(poolBiofilmState.provAudit.validated_cfd_pressure_Pa.classification, 'UNAVAILABLE');
        assert.strictEqual(poolBiofilmState.provAudit.control_5b_rpm_sensitivity.evidenceClassification, 'uncalibrated_model_snapshot');
        assert.strictEqual(poolBiofilmState.provAudit.control_5b_rpm_sensitivity.classification, 'PROVISIONAL_ASSUMPTION');
        assert.strictEqual(poolBiofilmState.provAudit.control_5b_rpm_sensitivity.outputClassification, 'ILLUSTRATIVE_SENSITIVITY_ANALYSIS');

        // Also exercise ?force2d=1 query parameter fallback in Session A
        await evalJson(`(() => {
          const ifr = document.getElementById('iframePoolBiofilm');
          ifr.src = 'reactor_pool_biofilm_explorer.html?force2d=1';
          return 'true';
        })()`);
        await new Promise(r => setTimeout(r, 1500));
        const force2dState = await evalJson(`(() => {
          const ifr = document.getElementById('iframePoolBiofilm');
          const w = ifr.contentWindow;
          const st = w.EXPLORER_STATE;
          return JSON.stringify({
            webglContextCreated: st.webgl_context_created,
            fallbackTriggered: st.fallback_triggered,
            renderModeMacro: st.render_mode_macro,
            renderModeMicro: st.render_mode_micro,
            geomClassification: st.geometry_provenance.geometry_classification,
            isTecdoc643BenchmarkGeometry: st.geometry_provenance.is_tecdoc643_benchmark_geometry
          });
        })()`);
        assert.strictEqual(force2dState.webglContextCreated, false);
        assert.strictEqual(force2dState.fallbackTriggered, true);
        assert.strictEqual(force2dState.renderModeMacro, 'canvas2d_fallback');
        assert.strictEqual(force2dState.renderModeMicro, 'canvas2d_fallback');
        assert.strictEqual(force2dState.geomClassification, 'SYNTHETIC_SCHEMATIC');
        assert.strictEqual(force2dState.isTecdoc643BenchmarkGeometry, false);

        console.log(`PASS [11/15]: Coordinated 3D Pool-and-Biofilm Explorer WebGL (Pool=${poolBiofilmState.glPoolWidth}x${poolBiofilmState.glPoolHeight}, Biofilm=${poolBiofilmState.glBioWidth}x${poolBiofilmState.glBioHeight}), ?force2d=1 fallback, separated provenance taxonomy, programmatic lambda_etc=0 & timeline firewall, 4 layers, 5 camera views, 4 morphotypes, 7 null controls, & Provenance on Demand verified.`);
        receipt.tests.reactor_pool_biofilm_3d_explorer = {
          glPoolWidth: poolBiofilmState.glPoolWidth,
          glPoolHeight: poolBiofilmState.glPoolHeight,
          glBioWidth: poolBiofilmState.glBioWidth,
          glBioHeight: poolBiofilmState.glBioHeight,
          renderModeMacro: poolBiofilmState.renderModeMacro,
          renderModeMicro: poolBiofilmState.renderModeMicro,
          defaultLambdaEtc: poolBiofilmState.defaultLambdaEtc,
          solversKeptSeparate: poolBiofilmState.defaultSolversSeparate,
          coupledValidationClaimed: poolBiofilmState.defaultCoupledClaimed,
          provenanceTaxonomySeparated: poolBiofilmState.provenanceTaxonomySeparated,
          passingRenderingTestsValidateSoftwareBoundariesNotPhysicalModel: poolBiofilmState.passingRenderingTestsValidateSoftwareBoundariesNotPhysicalModel,
          empiricalPhysicalOrBiologicalValidationClaimed: poolBiofilmState.empiricalPhysicalOrBiologicalValidationClaimed,
          timelineCouplingProgrammaticallyBlocked: poolBiofilmState.timelineCouplingProgrammaticallyBlocked,
          baselineNullControlEnforcesLambdaZero: poolBiofilmState.baselineNullControlEnforcesLambdaZero
        };

        // Test 12: Tab 12 Inferred Oklo Reactor Cycling & Hypothetical Hydrothermal Transport (oklo_hydrothermal_cycle_explorer.html)
        await evalJson(`(() => { setView('hydrocycle'); return 'true'; })()`);
        await new Promise(r => setTimeout(r, 1500));
        const hydroCycleState = await evalJson(`(() => {
          const ifr = document.getElementById('iframeHydroCycle');
          const d = ifr.contentDocument;
          const w = ifr.contentWindow;
          const glMacro = d.getElementById('glMacroCanvas');
          const cMacroFb = d.getElementById('canvasMacro2dFallback');
          const cMacro4p = d.getElementById('canvasMacro4Panel');
          const cMulti = d.getElementById('canvasMultiScale');
          const cKin = d.getElementById('canvasKineticsAndCxc');
          const gates = w.verifyOkloHydrothermalExplorerGates();
          const png1080 = w.exportCompetitionPng1080p();
          w.setFrameIndex(12);
          const st12 = w.HYDRO_CYCLE_STATE;
          const frame12TimeMin = st12.time_min;
          w.setFrameIndex(9);
          setPortalHydroAnimMode('hydro5stage');
          const portal5StageSrc = document.getElementById('portalCxVideoPlayer').getAttribute('src');
          setPortalHydroAnimMode('polymeryield');
          const portalPolySrc = document.getElementById('portalPmVideoPlayer').getAttribute('src');
          setPortalHydroAnimMode('6fields');
          const portal6FieldsSrc = document.getElementById('portalCxVideoPlayer').getAttribute('src');
          const portalFallbackMode = setPortalHydroAnimMode('invalid_mode');
          w.setAnimationGalleryMode('hydro5stage');
          const inner5StageSrc = d.getElementById('videoChimeraX').getAttribute('src');
          w.setAnimationGalleryMode('polymeryield');
          const innerPolySrc = d.getElementById('videoPyMOL').getAttribute('src');
          w.setAnimationGalleryMode('6fields');
          const inner6FieldsSrc = d.getElementById('videoChimeraX').getAttribute('src');
          return JSON.stringify({
            tabActive: document.getElementById('tabHydroCycle').classList.contains('active'),
            glMacroWidth: glMacro.width,
            glMacroHeight: glMacro.height,
            cMacroFbWidth: cMacroFb.width,
            cMacro4pWidth: cMacro4p.width,
            cMultiWidth: cMulti.width,
            cKinWidth: cKin.width,
            renderMode: st12.render_mode,
            webglContextCreated: st12.webgl_context_created,
            fallbackTriggered: st12.fallback_triggered,
            frame12TimeMin,
            gates,
            pngWidth: png1080.width,
            pngHeight: png1080.height,
            portal5StageSrc,
            portalPolySrc,
            portal6FieldsSrc,
            portalFallbackMode,
            inner5StageSrc,
            innerPolySrc,
            inner6FieldsSrc
          });
        })()`);
        assert.strictEqual(hydroCycleState.tabActive, true);
        assert.strictEqual(hydroCycleState.webglContextCreated, true);
        assert.strictEqual(hydroCycleState.fallbackTriggered, false);
        assert.strictEqual(hydroCycleState.renderMode, 'webgl+2d_synchronized');
        assert.ok(hydroCycleState.glMacroWidth > 350 && hydroCycleState.glMacroHeight > 220);
        assert.strictEqual(hydroCycleState.frame12TimeMin, 36.0);
        assert.strictEqual(hydroCycleState.gates.all_passed, true);
        assert.strictEqual(hydroCycleState.gates.frames_count, 60);
        assert.strictEqual(hydroCycleState.gates.has_all_5_synchronized_phases, true);
        assert.strictEqual(hydroCycleState.gates.xenon_isotope_record_shows_surface_geyser, false);
        assert.strictEqual(hydroCycleState.gates.oklo_gangue_equivalent_to_montmorillonite, false);
        assert.strictEqual(hydroCycleState.gates.cellular_eps_or_cell_wall_included, false);
        assert.strictEqual(hydroCycleState.gates.continuous_pulse_fixes_b017_discontinuity, true);
        assert.strictEqual(hydroCycleState.gates.c1_derivative_continuous_at_b017, true);
        assert.strictEqual(hydroCycleState.gates.extreme_slider_and_alias_edge_cases_passed, true);
        assert.strictEqual(hydroCycleState.gates.cxc_syntax_valid_single_transparency_per_volume, true);
        assert.strictEqual(hydroCycleState.gates.oligomer_synthesis_vs_destruction_competition_visible, true);
        assert.strictEqual(hydroCycleState.pngWidth, 1920);
        assert.strictEqual(hydroCycleState.pngHeight, 1080);
        assert.strictEqual(hydroCycleState.portal5StageSrc, 'chimerax_hydro_5stage_animation_1080p.mp4');
        assert.strictEqual(hydroCycleState.portalPolySrc, 'pymol_oklo_polymer_yield_1080p.mp4');
        assert.strictEqual(hydroCycleState.portal6FieldsSrc, 'chimerax_oklo_6fields_60frames_1080p.mp4');
        assert.strictEqual(hydroCycleState.portalFallbackMode, '6fields');
        assert.strictEqual(hydroCycleState.inner5StageSrc, 'chimerax_hydro_5stage_animation_1080p.mp4');
        assert.strictEqual(hydroCycleState.innerPolySrc, 'pymol_oklo_polymer_yield_1080p.mp4');
        assert.strictEqual(hydroCycleState.inner6FieldsSrc, 'chimerax_oklo_6fields_60frames_1080p.mp4');
        const rangeResp = await fetch(`http://127.0.0.1:${port}/chimerax_oklo_6fields_60frames_1080p.mp4`, {
          headers: { Range: 'bytes=0-1023' }
        });
        assert.strictEqual(rangeResp.status, 206);
        assert.strictEqual(rangeResp.headers.get('accept-ranges'), 'bytes');
        const rangeBuf = await rangeResp.arrayBuffer();
        assert.strictEqual(rangeBuf.byteLength, 1024);
        console.log(`PASS [12/16]: Inferred Oklo Reactor Cycling & Hypothetical Hydrothermal Transport WebGL (${hydroCycleState.glMacroWidth}x${hydroCycleState.glMacroHeight}), 5-phase/60-frame schedule, 3 scale windows, C^1 pulse fix across b=0.17, 6-term oligomer PDE, ChimeraX/PyMOL 1080p video switchers, & 1920x1080 PNG export verified.`);
        receipt.tests.oklo_hydrothermal_cycle_3d_explorer = {
          glMacroWidth: hydroCycleState.glMacroWidth,
          glMacroHeight: hydroCycleState.glMacroHeight,
          renderMode: hydroCycleState.renderMode,
          gates: hydroCycleState.gates
        };
      }
    );

    // Session B: WebGL disabled (--disable-webgl --disable-webgl2) to verify exception-safe 2-D Slice / Cut-Plane fallback
    await withChromeSession(
      ['--disable-webgl', '--disable-webgl2'],
      port,
      9238,
      async evalJson => {
        await evalJson(`(() => { setView('bio'); return 'true'; })()`);
        await new Promise(r => setTimeout(r, 1500));
        const bioFallback = await evalJson(`(() => {
          const ifr = document.getElementById('iframeBio');
          const d = ifr.contentDocument;
          const gl = d.getElementById('glCanvas');
          const sl = d.getElementById('sliceCanvas');
          return JSON.stringify({
            glHidden: gl.hidden,
            slHidden: sl.hidden,
            slWidth: sl.width,
            slHeight: sl.height,
            btn3dDisabled: d.getElementById('btnMode3d').disabled,
            kpiOcc: d.getElementById('kpiOcc').textContent
          });
        })()`);
        assert.strictEqual(bioFallback.glHidden, true);
        assert.strictEqual(bioFallback.slHidden, false);
        assert.ok(bioFallback.slWidth > 400 && bioFallback.slHeight > 350);
        assert.strictEqual(bioFallback.btn3dDisabled, true);
        assert.strictEqual(bioFallback.kpiOcc, '4,888');
        console.log(`PASS [13/16]: Biofilms 3-D disabled-WebGL 2-D Slice fallback verified (${bioFallback.slWidth}x${bioFallback.slHeight}, sites=${bioFallback.kpiOcc}).`);
        receipt.tests.biofilms_disabled_webgl_fallback = bioFallback;

        await evalJson(`(() => { setView('pool'); return 'true'; })()`);
        await new Promise(r => setTimeout(r, 1500));
        const poolFallback = await evalJson(`(() => {
          const ifr = document.getElementById('iframePool');
          const d = ifr.contentDocument;
          const w = ifr.contentWindow;
          const gl = d.getElementById('glCanvas');
          const sl = d.getElementById('sliceCanvas');
          const gates = w.verifyPoolWaterAcceptanceGates();
          return JSON.stringify({
            glHidden: gl.hidden,
            slHidden: sl.hidden,
            slWidth: sl.width,
            slHeight: sl.height,
            btn3dDisabled: d.getElementById('btnMode3d').disabled,
            kpiTemp: d.getElementById('kpiTemp').textContent,
            gatesPass: gates.gate0_provenancePreserved && gates.gate2_modulesIndependent && gates.gate3_missingFieldsRemainUnavailable
          });
        })()`);
        assert.strictEqual(poolFallback.glHidden, true);
        assert.strictEqual(poolFallback.slHidden, false);
        assert.ok(poolFallback.slWidth > 400 && poolFallback.slHeight > 350);
        assert.strictEqual(poolFallback.btn3dDisabled, true);
        assert.strictEqual(poolFallback.gatesPass, true);
        console.log(`PASS [14/16]: Pool-Water Interactive disabled-WebGL 2-D Cut-Plane fallback verified (${poolFallback.slWidth}x${poolFallback.slHeight}, T_max=${poolFallback.kpiTemp}).`);
        receipt.tests.poolwater_disabled_webgl_fallback = poolFallback;

        await evalJson(`(() => { setView('magneto'); return 'true'; })()`);
        await new Promise(r => setTimeout(r, 1500));
        const magnetoFallback = await evalJson(`(() => {
          const ifr = document.getElementById('iframeMagneto');
          const d = ifr.contentDocument;
          const w = ifr.contentWindow;
          const gl = d.getElementById('glField');
          const fb = d.getElementById('canvas2d');
          const gates4d = w.verifyBiotite4dMagnetoreceptionGates();
          return JSON.stringify({
            glHidden: gl.hidden,
            fbHidden: fb.hidden,
            fbWidth: fb.width,
            fbHeight: fb.height,
            btn3dDisabled: d.getElementById('btnRender3d').disabled,
            gates4dPass: gates4d.all_scenarios_realistic_default_false && gates4d.biotite_table_rows === 6 && gates4d.gate_ids.length === 4
          });
        })()`);
        assert.strictEqual(magnetoFallback.glHidden, true);
        assert.strictEqual(magnetoFallback.fbHidden, false);
        assert.ok(magnetoFallback.fbWidth > 400 && magnetoFallback.fbHeight > 350);
        assert.strictEqual(magnetoFallback.btn3dDisabled, true);
        assert.strictEqual(magnetoFallback.gates4dPass, true);
        console.log(`PASS [15/16]: Biotite 4D Magnetoreception disabled-WebGL 2-D Cross-Section fallback verified (${magnetoFallback.fbWidth}x${magnetoFallback.fbHeight}).`);
        receipt.tests.biotite_magnetoreception_disabled_webgl_fallback = magnetoFallback;

        await evalJson(`(() => { setView('poolbiofilm'); return 'true'; })()`);
        await new Promise(r => setTimeout(r, 1500));
        const poolBiofilmFallback = await evalJson(`(() => {
          const ifr = document.getElementById('iframePoolBiofilm');
          const d = ifr.contentDocument;
          const w = ifr.contentWindow;
          const cPool2d = d.getElementById('canvasPool2d');
          const cBio2d = d.getElementById('canvasBiofilm2d');
          const st = w.EXPLORER_STATE;
          const bCheck = w.__POOL_BIOFILM_EXPLORER__.verifyScientificBoundaries();
          return JSON.stringify({
            renderModeMacro: st.render_mode_macro,
            renderModeMicro: st.render_mode_micro,
            webglContextCreated: st.webgl_context_created,
            fallbackTriggered: st.fallback_triggered,
            cPool2dWidth: cPool2d.width,
            cPool2dHeight: cPool2d.height,
            cBio2dWidth: cBio2d.width,
            cBio2dHeight: cBio2d.height,
            frameCount: st.frame_count,
            gatesPass: bCheck.all_passed && st.solvers_kept_separate && !st.solver_level_coupled_validation_claimed && st.lambda_etc === 0.0 && Number.isNaN(st.seconds_per_mcs)
          });
        })()`);
        assert.strictEqual(poolBiofilmFallback.renderModeMacro, 'canvas2d_fallback');
        assert.strictEqual(poolBiofilmFallback.renderModeMicro, 'canvas2d_fallback');
        assert.strictEqual(poolBiofilmFallback.webglContextCreated, false);
        assert.strictEqual(poolBiofilmFallback.fallbackTriggered, true);
        assert.ok(poolBiofilmFallback.cPool2dWidth > 350 && poolBiofilmFallback.cPool2dHeight > 280);
        assert.ok(poolBiofilmFallback.cBio2dWidth > 350 && poolBiofilmFallback.cBio2dHeight > 240);
        assert.ok(poolBiofilmFallback.frameCount >= 1);
        assert.strictEqual(poolBiofilmFallback.gatesPass, true);
        console.log(`PASS [16a/16]: Coordinated 3D Pool-and-Biofilm disabled-WebGL 2-D Cutaway fallback verified (Pool=${poolBiofilmFallback.cPool2dWidth}x${poolBiofilmFallback.cPool2dHeight}, Biofilm=${poolBiofilmFallback.cBio2dWidth}x${poolBiofilmFallback.cBio2dHeight}).`);
        receipt.tests.reactor_pool_biofilm_disabled_webgl_fallback = poolBiofilmFallback;

        await evalJson(`(() => { setView('hydrocycle'); return 'true'; })()`);
        await new Promise(r => setTimeout(r, 1500));
        const hydroCycleFallback = await evalJson(`(() => {
          const ifr = document.getElementById('iframeHydroCycle');
          const d = ifr.contentDocument;
          const w = ifr.contentWindow;
          const cMacroFb = d.getElementById('canvasMacro2dFallback');
          const st = w.HYDRO_CYCLE_STATE;
          const gates = w.verifyOkloHydrothermalExplorerGates();
          return JSON.stringify({
            renderMode: st.render_mode,
            webglContextCreated: st.webgl_context_created,
            fallbackTriggered: st.fallback_triggered,
            cMacroFbWidth: cMacroFb.width,
            cMacroFbHeight: cMacroFb.height,
            gatesPass: gates.all_passed
          });
        })()`);
        assert.strictEqual(hydroCycleFallback.renderMode, 'canvas2d_fallback');
        assert.strictEqual(hydroCycleFallback.webglContextCreated, false);
        assert.strictEqual(hydroCycleFallback.fallbackTriggered, true);
        assert.ok(hydroCycleFallback.cMacroFbWidth > 350 && hydroCycleFallback.cMacroFbHeight > 220);
        assert.strictEqual(hydroCycleFallback.gatesPass, true);
        console.log(`PASS [16b/16]: Oklo Coupled Hydrothermal Cycle disabled-WebGL 2-D Cut-Plane & Fence fallback verified (${hydroCycleFallback.cMacroFbWidth}x${hydroCycleFallback.cMacroFbHeight}).`);
        receipt.tests.oklo_hydrothermal_cycle_disabled_webgl_fallback = hydroCycleFallback;
      }
    );

    const receiptPath = path.join(ROOT, 'ci_verification_receipt.json');
    if (fs.existsSync(receiptPath)) {
      try {
        const prevReceipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
        const stripStochastic = r => {
          const clone = JSON.parse(JSON.stringify({
            schema: r.schema,
            gate0_files_verified: r.gate0_files_verified,
            tests: r.tests || {}
          }));
          if (clone.tests && clone.tests.tecdoc643_3d_webgl) {
            delete clone.tests.tecdoc643_3d_webgl.kval;
            delete clone.tests.tecdoc643_3d_webgl.ntot;
          }
          return JSON.stringify(clone);
        };
        if (stripStochastic(prevReceipt) === stripStochastic(receipt) && prevReceipt.generated_at) {
          receipt.generated_at = prevReceipt.generated_at;
          if (prevReceipt.tests && prevReceipt.tests.tecdoc643_3d_webgl && receipt.tests.tecdoc643_3d_webgl) {
            receipt.tests.tecdoc643_3d_webgl.kval = prevReceipt.tests.tecdoc643_3d_webgl.kval;
            receipt.tests.tecdoc643_3d_webgl.ntot = prevReceipt.tests.tecdoc643_3d_webgl.ntot;
          }
        }
      } catch (_) {}
    }
    fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n');
    console.log('WROTE ci_verification_receipt.json successfully.');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('REGRESSION TEST FAILED:', err);
  process.exit(1);
});
