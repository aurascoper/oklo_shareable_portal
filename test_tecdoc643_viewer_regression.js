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
      sha256: 'ec440f838d6c70263dcad3efef11da2159ab7f4d793d885367e4811415f8147d',
      bytes: 6018
    },
    {
      path: 'biofilms_3d_explorer.html',
      sha256: '037e2050b70e92b77075b3b913aeed615457d6a1cb09a0fe85f4d6b14d96366d',
      bytes: 869267
    },
    {
      path: 'poolwater_interactive.html',
      sha256: 'fa0f0dc30c45681a3b774db8533110370ebdce77b91317b003bfdc065a639b5a',
      bytes: 79610
    },
    {
      path: 'POOLWATER_WORKFLOW_SPEC.md',
      sha256: '2969c35e198d0019d3b8a970754eb6a75754428c93724049822be96759db0669',
      bytes: 17684
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
      sha256: 'ba18d4869398c6ae26bb66b34516816bd8cc926944225d2783916e83f8bb1004',
      bytes: 261273
    },
    {
      path: 'evidence_manifest.json',
      sha256: '4f61d995772ee055fd0df378d4884bc8b2a2be235877ffc4b4424fc519f9cacf',
      bytes: 116876
    },
    {
      path: 'test_calculation_provenance_and_invariants.js',
      sha256: 'db751a8972ee125fe4e334cdc59c51f1f3c5784b03026119587b50a3cd65fb55',
      bytes: 38751
    },
    {
      path: 'benchmark_manifest.json',
      sha256: '6311cd0d9e19b1edce0a1ebc9d72c7d74710d6cdaf04c0a9e77c3a6a28c4c572',
      bytes: 17965
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
  assert.ok(indexHtml.includes('dc15eb934fe6cd32...'), 'index.html missing Gate-0 REF-NW-HTML-01 SHA prefix');
  assert.ok(indexHtml.includes('fa0f0dc30c45681a...'), 'index.html missing POOLWATER-3D-INTERACTIVE-01 SHA prefix');
  assert.ok(indexHtml.includes('037e2050b70e92b7...'), 'index.html missing BIOFILMS-3D-CPM-01 SHA prefix');
  assert.ok(indexHtml.includes('e73622d6454a3a6a...'), 'index.html missing BIOFILMS-ROBIN-CYL-GIF-01 SHA prefix');
  assert.ok(indexHtml.includes('ba18d4869398c6ae...'), 'index.html missing BIOTITE-MAGNETORECEPTION-4D-01 SHA prefix');
  console.log('PASS [1/13]: Gate-0 artifact hashes, byte counts, and manifests verified.');
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
        ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
        ext === '.png' ? 'image/png' :
        ext === '.xml' ? 'application/xml' : 'text/plain';
      res.writeHead(200, { 'Content-Type': mime });
      res.end(fs.readFileSync(fp));
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
    for (let attempt = 0; attempt < 60; attempt++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        tabs = await fetch(`http://127.0.0.1:${debugPort}/json`).then(r => r.json());
        if (Array.isArray(tabs) && tabs.some(t => t.type === 'page' && t.url && t.url.includes('index.html'))) break;
      } catch (_) {}
    }
    const page = Array.isArray(tabs) ? tabs.find(t => t.type === 'page' && t.url && t.url.includes('index.html')) : null;
    assert.ok(page, `Failed to attach to index.html page target in Chrome on debugPort ${debugPort}`);
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise(r => ws.addEventListener('open', r));

    let msgId = 0;
    const call = (method, params = {}) =>
      new Promise(resolve => {
        const cid = ++msgId;
        const handler = ev => {
          const msg = JSON.parse(ev.data);
          if (msg.id === cid) {
            ws.removeEventListener('message', handler);
            resolve(msg);
          }
        };
        ws.addEventListener('message', handler);
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
          const cNw = document.getElementById('cardNw');
          const cPool = document.getElementById('cardPool');
          const cMag = document.getElementById('cardMagneto');
          return JSON.stringify({
            nwSrc: ifrNw.getAttribute('src'),
            nwDataSrc: ifrNw.getAttribute('data-src'),
            poolSrc: ifrPool.getAttribute('src'),
            poolDataSrc: ifrPool.getAttribute('data-src'),
            bioSrc: ifrBio.getAttribute('src'),
            magSrc: ifrMag.getAttribute('src'),
            magDataSrc: ifrMag.getAttribute('data-src'),
            nwHiddenClass: cNw.classList.contains('is-hidden'),
            poolHiddenClass: cPool.classList.contains('is-hidden'),
            magHiddenClass: cMag.classList.contains('is-hidden')
          });
        })()`);
        assert.strictEqual(tab1State.nwSrc, null, 'iframeNw should not load eagerly while on Tab 1');
        assert.strictEqual(tab1State.poolSrc, null, 'iframePool should not load eagerly while on Tab 1');
        assert.strictEqual(tab1State.bioSrc, null, 'iframeBio should not load eagerly while on Tab 1');
        assert.strictEqual(tab1State.magSrc, null, 'iframeMagneto should not load eagerly while on Tab 1');
        assert.strictEqual(tab1State.nwDataSrc, 'tecdoc643_neutron_walk.html');
        assert.strictEqual(tab1State.poolDataSrc, 'poolwater_interactive.html');
        assert.strictEqual(tab1State.magDataSrc, 'magnetoreception_3d_explorer.html');
        assert.strictEqual(tab1State.nwHiddenClass, true);
        assert.strictEqual(tab1State.poolHiddenClass, true);
        assert.strictEqual(tab1State.magHiddenClass, true);
        console.log('PASS [2/13]: Hidden-tab lazy initialization verified (iframeNw, iframePool, iframeBio, iframeMagneto deferred on Tab 1).');
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
            syncReadout
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
        assert.strictEqual(magnetoState.gates4d.criterial_colors.accepted_verified, '#22c55e');
        assert.strictEqual(magnetoState.gates4d.criterial_colors.criterial_pruned, '#ef4444');
        assert.strictEqual(magnetoState.w45Val, 45, 'Expected #slider4dW to accept non-15-multiple angle 45 without quantization');
        assert.strictEqual(magnetoState.lblHyperBoundary, '-90 / 90 / -90 deg');
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
        console.log(`PASS [10/13]: Biotite, Biomagnetite & Cryptochrome 4D Magnetoreception Viewer WebGL (${magnetoState.glWidth}x${magnetoState.glHeight}), EG-1..EG-4, 7-regime & 8-element D_4 4D scrubber, & 3-mode 1920x1080 PNG export verified.`);
        receipt.tests.biotite_magnetoreception_4d_viewer = {
          glWidth: magnetoState.glWidth,
          glHeight: magnetoState.glHeight,
          gates4d: magnetoState.gates4d,
          walkGates: magnetoState.walkGates,
          pngExport: pngExportRes,
          multiModeExport: multiModeExportRes
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
        console.log(`PASS [11/13]: Biofilms 3-D disabled-WebGL 2-D Slice fallback verified (${bioFallback.slWidth}x${bioFallback.slHeight}, sites=${bioFallback.kpiOcc}).`);
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
        console.log(`PASS [12/13]: Pool-Water Interactive disabled-WebGL 2-D Cut-Plane fallback verified (${poolFallback.slWidth}x${poolFallback.slHeight}, T_max=${poolFallback.kpiTemp}).`);
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
        console.log(`PASS [13/13]: Biotite 4D Magnetoreception disabled-WebGL 2-D Cross-Section fallback verified (${magnetoFallback.fbWidth}x${magnetoFallback.fbHeight}).`);
        receipt.tests.biotite_magnetoreception_disabled_webgl_fallback = magnetoFallback;
      }
    );

    fs.writeFileSync(path.join(ROOT, 'ci_verification_receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
    console.log('WROTE ci_verification_receipt.json successfully.');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('REGRESSION TEST FAILED:', err);
  process.exit(1);
});
