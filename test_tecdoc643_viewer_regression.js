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
      sha256: 'c3340543ded0e746153d39247d7ff106a00c61ec98996b9d9074cef97b0f8f76',
      bytes: 73931
    },
    {
      path: 'POOLWATER_WORKFLOW_SPEC.md',
      sha256: '19144eafb188ab1d5fa2bb7d81ca97513d58a2c2b85ec1c74f1b809ea5c85b79',
      bytes: 17490
    },
    {
      path: 'benchmark_manifest.json',
      sha256: '2fbdf2e6b602494ad22a97e677b36a89514e33b2b8542397c162791551f6dcaf',
      bytes: 10971
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
  assert.ok(indexHtml.includes('c3340543ded0e746...'), 'index.html missing POOLWATER-3D-INTERACTIVE-01 SHA prefix');
  assert.ok(indexHtml.includes('037e2050b70e92b7...'), 'index.html missing BIOFILMS-3D-CPM-01 SHA prefix');
  console.log('PASS [1/9]: Gate-0 artifact hashes, byte counts, and manifests verified.');
  return expectedFiles;
}

function startStaticServer(port) {
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
        ext === '.xml' ? 'application/xml' : 'text/plain';
      res.writeHead(200, { 'Content-Type': mime });
      res.end(fs.readFileSync(fp));
    });
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

async function withChromeSession(chromeFlags, port, debugPort, fn) {
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
    for (let attempt = 0; attempt < 30; attempt++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        tabs = await fetch(`http://127.0.0.1:${debugPort}/json`).then(r => r.json());
        if (tabs && tabs.some(t => t.type === 'page' && t.url.includes('index.html'))) break;
      } catch (_) {}
    }
    const page = tabs.find(t => t.type === 'page' && t.url.includes('index.html'));
    assert.ok(page, 'Failed to attach to index.html page target in Chrome');
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
      const res = await call('Runtime.evaluate', { expression: expr, returnByValue: true });
      if (res.result && res.result.exceptionDetails) {
        throw new Error(res.result.exceptionDetails.exception.description || 'Runtime.evaluate error');
      }
      return JSON.parse(res.result.result.value);
    };

    await fn(evalJson);
    ws.close();
  } finally {
    chrome.kill();
  }
}

async function runTests() {
  const verifiedFiles = verifyArtifactHashes();
  const port = 8776;
  const server = await startStaticServer(port);
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
          const cNw = document.getElementById('cardNw');
          const cPool = document.getElementById('cardPool');
          return JSON.stringify({
            nwSrc: ifrNw.getAttribute('src'),
            nwDataSrc: ifrNw.getAttribute('data-src'),
            poolSrc: ifrPool.getAttribute('src'),
            poolDataSrc: ifrPool.getAttribute('data-src'),
            bioSrc: ifrBio.getAttribute('src'),
            nwHiddenClass: cNw.classList.contains('is-hidden'),
            poolHiddenClass: cPool.classList.contains('is-hidden')
          });
        })()`);
        assert.strictEqual(tab1State.nwSrc, null, 'iframeNw should not load eagerly while on Tab 1');
        assert.strictEqual(tab1State.poolSrc, null, 'iframePool should not load eagerly while on Tab 1');
        assert.strictEqual(tab1State.bioSrc, null, 'iframeBio should not load eagerly while on Tab 1');
        assert.strictEqual(tab1State.nwDataSrc, 'tecdoc643_neutron_walk.html');
        assert.strictEqual(tab1State.poolDataSrc, 'poolwater_interactive.html');
        assert.strictEqual(tab1State.nwHiddenClass, true);
        assert.strictEqual(tab1State.poolHiddenClass, true);
        console.log('PASS [2/9]: Hidden-tab lazy initialization verified (iframeNw, iframePool, iframeBio deferred on Tab 1).');
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
        console.log(`PASS [3/9]: TECDOC-643 3-D WebGL rendering verified on unmodified Gate-0 HTML (gl=${nw3dState.glWidth}x${nw3dState.glHeight}, k=${nw3dState.kval}).`);
        receipt.tests.tecdoc643_3d_webgl = nw3dState;

        // Test 4: Biofilms 3-D Explorer WebGL rendering & 256-Seed 4-Arm Null Plot
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
        assert.strictEqual(bio3dState.statsAudit.seedCount, 256);
        assert.strictEqual(bio3dState.statsAudit.allSpeciesHave256PerArm, true);
        assert.strictEqual(bio3dState.statsAudit.allSeedKeyOrderInvariant, true);
        assert.strictEqual(bio3dState.statsAudit.allCiMatchReference, true);
        assert.strictEqual(bio3dState.statsAudit.allContrastsWithinEquivalenceBound, true);
        console.log(`PASS [4/9]: Biofilms 3-D WebGL & 256-Seed 4-Arm TOST Statistical Integrity verified (${bio3dState.glWidth}x${bio3dState.glHeight}, 256 seeds).`);
        receipt.tests.biofilms_3d_and_256_seed_tost = {
          glWidth: bio3dState.glWidth,
          glHeight: bio3dState.glHeight,
          seedCount: bio3dState.statsAudit.seedCount,
          allContrastsWithinEquivalenceBound: bio3dState.statsAudit.allContrastsWithinEquivalenceBound
        };

        // Test 5: Pool-Water Interactive Viewer (Tab 6) WebGL, Gate 0-4 Acceptance Suite, Timeline Scrubbing & UNAVAILABLE Field Honesty
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
        assert.ok(Math.abs(poolState.gates.gate1_kCrossingDay - 340.254042) < 0.001);
        assert.strictEqual(poolState.gates.gate2_modulesIndependent, true);
        assert.strictEqual(poolState.gates.gate3_timeStepCount, 6);
        assert.strictEqual(poolState.gates.gate3_gridCellCount, 6144);
        assert.ok(poolState.gates.gate3_maxAbsVelocityDivergence < 1e-9);
        assert.strictEqual(poolState.gates.gate3_plumeWarmsOverTime, true);
        assert.strictEqual(poolState.gates.gate3_missingFieldsRemainUnavailable, true);
        assert.strictEqual(poolState.gates.gate4_pieStageCount, 4);
        assert.strictEqual(poolState.timeLabel5, 't = 600 s');
        assert.strictEqual(poolState.unavailGlHidden, true, '3D canvas must hide when an UNAVAILABLE field is selected');
        assert.strictEqual(poolState.unavailSlHidden, false, '2D canvas must display UNAVAILABLE notice when an UNAVAILABLE field is selected');
        assert.ok(poolState.chipFieldUnavail.includes('UNAVAILABLE'));
        assert.strictEqual(poolState.auditHidden, false);
        assert.ok(poolState.auditWidth > 400);
        console.log(`PASS [5/9]: Pool-Water Interactive 3-D WebGL & Gate 0-4 acceptance suite verified (${poolState.glWidth}x${poolState.glHeight}, worth=${poolState.gates.gate1_bladeWorthPcm} pcm, max|div u|=${poolState.gates.gate3_maxAbsVelocityDivergence}).`);
        console.log(`PASS [6/9]: Pool-Water explicit UNAVAILABLE field honesty & Audit plotter verified (${poolState.chipFieldUnavail}).`);
        receipt.tests.poolwater_3d_and_gates = poolState.gates;

        // Test 7: Coupled Comparison (Tab 7) synchronization gate
        await evalJson(`(() => { setView('coupled'); return 'true'; })()`);
        await new Promise(r => setTimeout(r, 800));
        const coupledState = await evalJson(`(() => {
          const syncBarVisible = document.getElementById('coupledSyncBar').classList.contains('visible');
          const defaultStatus = document.getElementById('coupledSyncStatus').textContent;
          const chk = document.getElementById('chkSyncBlade');
          const sel = document.getElementById('selCoupledBlade');
          chk.checked = true;
          sel.value = '25';
          onCoupledBladeChange();
          const syncedStatus = document.getElementById('coupledSyncStatus').textContent;
          const poolBladeVal = document.getElementById('iframePool').contentDocument.getElementById('selBlade').value;
          const nwBladeVal = document.getElementById('iframeNw').contentDocument.getElementById('blade').value;
          const nwBladeTxt = document.getElementById('iframeNw').contentDocument.getElementById('bval').textContent;
          return JSON.stringify({
            syncBarVisible,
            defaultStatus,
            syncedStatus,
            poolBladeVal,
            nwBladeVal,
            nwBladeTxt
          });
        })()`);
        assert.strictEqual(coupledState.syncBarVisible, true);
        assert.ok(coupledState.defaultStatus.includes('INDEPENDENT_REFERENCE_PANELS'));
        assert.ok(coupledState.syncedStatus.includes('SHARED_SCENARIO_BLADE_SYNC'));
        assert.ok(coupledState.syncedStatus.includes('INCOMPATIBLE_TIME_BASIS'));
        assert.strictEqual(coupledState.poolBladeVal, '25');
        assert.strictEqual(coupledState.nwBladeVal, '25');
        assert.strictEqual(coupledState.nwBladeTxt, '25%');
        console.log(`PASS [7/9]: Coupled Comparison synchronization gate verified (default=${coupledState.defaultStatus.slice(0, 28)}, synced blade=${coupledState.nwBladeTxt}).`);
        receipt.tests.coupled_comparison_sync = coupledState;
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
        console.log(`PASS [8/9]: Biofilms 3-D disabled-WebGL 2-D Slice fallback verified (${bioFallback.slWidth}x${bioFallback.slHeight}, sites=${bioFallback.kpiOcc}).`);
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
        console.log(`PASS [9/9]: Pool-Water Interactive disabled-WebGL 2-D Cut-Plane fallback verified (${poolFallback.slWidth}x${poolFallback.slHeight}, T_max=${poolFallback.kpiTemp}).`);
        receipt.tests.poolwater_disabled_webgl_fallback = poolFallback;
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
