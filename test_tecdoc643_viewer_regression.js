#!/usr/bin/env node
/**
 * Regression Test Suite for TECDOC-643 Neutron Walk Viewer & Portal Embedding
 *
 * Verifies:
 * 1. Provenance & Frozen Fixture Integrity (artifact_index.xml + README.md SHA-256 & byte counts)
 * 2. Hidden-Tab Initialization (lazy-loading #iframeNw only after Tab 2 / Tab 3 is visible)
 * 3. Normal 3-D WebGL Rendering (gl.width > 0, gl.height > 0, gl.hidden === false, dark #0b1a24 screen, live tally)
 * 4. Disabled WebGL Exception Fallback (THREE loaded + WebGLRenderer throws -> 2-D Slice fallback + working tally)
 * 5. Embedded Layout & Split-View Scrolling (data-embedded="1", non-sticky viewer in narrow split view, no overlap)
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

  const expectedFiles = [
    {
      path: 'oklo_r0_fixture_readonly.html',
      sha256: '8dac3ae9b8268a476b791f8c2293130e899d5c86c7fab09ce27345de2333544d',
      bytes: 77117
    },
    {
      path: 'spacetime_explorer_4d_shareable.html',
      sha256: 'f9ca39ea37503f0e2012ad3dd5aad05ef26709337d5e84f83df89234920b4612',
      bytes: 132358
    },
    {
      path: 'tecdoc643_reference_fixture.jl',
      sha256: '813c9e9fb33e47d9ceead8ea8f08bf07122583cf4292aab651d4f919a572a849',
      bytes: 5951
    },
    {
      path: 'tecdoc643_neutron_walk.html',
      sha256: 'a463adfac1fbf8aa60b52f937d8f180e0c69678af2103bca4199718f8f849650',
      bytes: 939350
    },
    {
      path: 'biofilms_3d_explorer.html',
      sha256: 'f6557e3426a890e1515335e0d3710fad84707d1c0c5bacc9057ca713ab9a606c',
      bytes: 861182
    }
  ];

  for (const item of expectedFiles) {
    const actual = sha256File(item.path);
    assert.strictEqual(actual.bytes, item.bytes, `${item.path} byte size mismatch`);
    assert.strictEqual(actual.sha256, item.sha256, `${item.path} SHA-256 mismatch`);
    assert.ok(xml.includes(`<Bytes>${item.bytes}</Bytes>`), `artifact_index.xml missing byte count for ${item.path}`);
    assert.ok(xml.includes(`<SHA256>${item.sha256}</SHA256>`), `artifact_index.xml missing SHA-256 for ${item.path}`);
    assert.ok(readme.includes(item.sha256), `README.md missing SHA-256 for ${item.path}`);
  }
  assert.ok(indexHtml.includes('a463adfac1fbf8aa...'), 'index.html missing updated REF-NW-HTML-01 SHA prefix');
  assert.ok(indexHtml.includes('(939,350 bytes)'), 'index.html missing updated REF-NW-HTML-01 byte count');
  console.log('PASS [1/5]: Artifact hashes, byte counts, and frozen R0 fixture verified.');
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
      const mime = ext === '.html' ? 'text/html' : ext === '.js' ? 'text/javascript' : ext === '.xml' ? 'application/xml' : 'text/plain';
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
    for (let attempt = 0; attempt < 25; attempt++) {
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
  verifyArtifactHashes();

  const port = 8775;
  const server = await startStaticServer(port);

  try {
    // Session A: WebGL enabled via SwiftShader ANGLE
    await withChromeSession(
      ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
      port,
      9235,
      async evalJson => {
        // Test 2: Hidden-tab initialization on Tab 1
        const tab1State = await evalJson(`(() => {
          const ifrNw = document.getElementById('iframeNw');
          const cNw = document.getElementById('cardNw');
          return JSON.stringify({
            nwSrc: ifrNw.getAttribute('src'),
            nwDataSrc: ifrNw.getAttribute('data-src'),
            nwHiddenClass: cNw.classList.contains('is-hidden')
          });
        })()`);
        assert.strictEqual(tab1State.nwSrc, null, 'iframeNw should not load eagerly while on Tab 1');
        assert.strictEqual(tab1State.nwDataSrc, 'tecdoc643_neutron_walk.html');
        assert.strictEqual(tab1State.nwHiddenClass, true);
        console.log('PASS [2/5]: Hidden-tab lazy initialization verified (iframeNw deferred on Tab 1).');

        // Test 3: Normal 3-D WebGL rendering on Tab 2
        await evalJson(`(() => { setView('nw'); return 'true'; })()`);
        await new Promise(r => setTimeout(r, 2500));
        const nw3dState = await evalJson(`(() => {
          const ifr = document.getElementById('iframeNw');
          const d = ifr.contentDocument;
          const w = ifr.contentWindow;
          const gl = d.getElementById('gl');
          const sl = d.getElementById('sl');
          const stg = d.getElementById('stage');
          const viewer = d.querySelector('.console > .viewer');
          const side = d.querySelector('.console > .side');
          return JSON.stringify({
            embeddedAttr: d.documentElement.getAttribute('data-embedded'),
            screenCss: w.getComputedStyle(d.documentElement).getPropertyValue('--screen').trim(),
            glWidth: gl.width,
            glHeight: gl.height,
            glHidden: gl.hidden,
            slHidden: sl.hidden,
            m3dDisabled: d.getElementById('m3d').disabled,
            stageWidth: stg.clientWidth,
            stageHeight: stg.clientHeight,
            viewerTop: viewer.getBoundingClientRect().top,
            sideTop: side.getBoundingClientRect().top,
            kval: d.getElementById('kval').textContent,
            ntot: d.getElementById('ntot').textContent
          });
        })()`);
        assert.strictEqual(nw3dState.embeddedAttr, '1');
        assert.strictEqual(nw3dState.screenCss, '#0b1a24');
        assert.ok(nw3dState.glWidth > 400 && nw3dState.glHeight > 350, `Expected non-zero 3D canvas, got ${nw3dState.glWidth}x${nw3dState.glHeight}`);
        assert.strictEqual(nw3dState.glHidden, false);
        assert.strictEqual(nw3dState.slHidden, true);
        assert.strictEqual(nw3dState.m3dDisabled, false);
        assert.ok(nw3dState.viewerTop < 180 && nw3dState.sideTop < 180, 'Embedded header should keep viewer and side controls near top of viewport');
        assert.notStrictEqual(nw3dState.kval, '\u2014');
        assert.ok(!nw3dState.ntot.includes('(0 neutrons)'), `Expected live tally, got ${nw3dState.ntot}`);
        console.log(`PASS [3/5]: Normal 3-D WebGL rendering verified (${nw3dState.glWidth}x${nw3dState.glHeight}, k=${nw3dState.kval}, ${nw3dState.ntot}).`);

        // Test 5: Split-view narrow scrolling & non-sticky viewer
        await evalJson(`(() => { setView('split'); return 'true'; })()`);
        await new Promise(r => setTimeout(r, 400));
        const splitState = await evalJson(`(() => {
          const ifr = document.getElementById('iframeNw');
          const d = ifr.contentDocument;
          const w = ifr.contentWindow;
          const viewer = d.querySelector('.console > .viewer');
          const side = d.querySelector('.console > .side');
          w.scrollTo(0, 480);
          const vRect = viewer.getBoundingClientRect();
          const sRect = side.getBoundingClientRect();
          return JSON.stringify({
            iframeWidth: ifr.clientWidth,
            viewerPos: w.getComputedStyle(viewer).position,
            viewerTopAfterScroll: vRect.top,
            viewerBottomAfterScroll: vRect.bottom,
            sideTopAfterScroll: sRect.top
          });
        })()`);
        assert.strictEqual(splitState.viewerPos, 'relative', 'Viewer must be position:relative when embedded / in split view');
        assert.ok(splitState.viewerTopAfterScroll < -200, `Viewer should scroll upward with page, got top=${splitState.viewerTopAfterScroll}`);
        assert.ok(splitState.viewerBottomAfterScroll <= splitState.sideTopAfterScroll + 2, 'Viewer must not overlap side controls when scrolled in split view');
        console.log(`PASS [4/7]: Split-view layout & scrolling verified (position=${splitState.viewerPos}, no overlap).`);

        // Test 5: Biofilms 3-D Explorer WebGL rendering, MCS 0 / MCS 100 arm verification & 256-Seed 4-Arm Null Plot
        await evalJson(`(() => { setView('bio'); return 'true'; })()`);
        await new Promise(r => setTimeout(r, 1500));
        const bio3dState = await evalJson(`(() => {
          const ifr = document.getElementById('iframeBio');
          const d = ifr.contentDocument;
          const gl = d.getElementById('glCanvas');
          const sl = d.getElementById('sliceCanvas');
          const ens = d.getElementById('ensembleCanvas');
          const kpiOcc = d.getElementById('kpiOcc').textContent;
          const kpiMatch100 = d.getElementById('kpiMatch').textContent;
          // Switch to MCS 0 and verify 100.0% match across Full and Null arms
          const slider = d.getElementById('mcsSlider');
          slider.value = '0';
          slider.dispatchEvent(new Event('input'));
          const kpiOcc0 = d.getElementById('kpiOcc').textContent;
          const kpiMatch0 = d.getElementById('kpiMatch').textContent;
          // Switch to 256-Seed 4-Arm Null Plot and test paired within-seed contrast view + statistical integrity
          d.getElementById('btnModeEnsemble').click();
          d.getElementById('btnEnsContrast').click();
          const statsAudit = ifr.contentWindow.verifyEnsembleStatisticalIntegrity();
          return JSON.stringify({
            embedded: d.documentElement.getAttribute('data-embedded'),
            glWidth: gl.width,
            glHeight: gl.height,
            glHiddenInitially: false,
            ensHiddenAfterClick: ens.hidden,
            ensWidth: ens.width,
            ensHeight: ens.height,
            ensContrastActive: d.getElementById('btnEnsContrast').classList.contains('on'),
            kpiOcc100: kpiOcc,
            kpiMatch100,
            kpiOcc0,
            kpiMatch0,
            manifestSha: d.getElementById('manifestSha').textContent,
            statsAudit
          });
        })()`);
        assert.strictEqual(bio3dState.embedded, '1');
        assert.ok(bio3dState.glWidth > 400 && bio3dState.glHeight > 350, `Expected sized Biofilms 3D canvas, got ${bio3dState.glWidth}x${bio3dState.glHeight}`);
        assert.strictEqual(bio3dState.ensHiddenAfterClick, false, 'Ensemble canvas should be visible after clicking #btnModeEnsemble');
        assert.ok(bio3dState.ensWidth > 400 && bio3dState.ensHeight > 350, `Expected sized Ensemble canvas, got ${bio3dState.ensWidth}x${bio3dState.ensHeight}`);
        assert.strictEqual(bio3dState.ensContrastActive, true, '#btnEnsContrast should be active');
        assert.strictEqual(bio3dState.kpiOcc100, '4,888');
        assert.strictEqual(bio3dState.kpiOcc0, '3,038');
        assert.strictEqual(bio3dState.kpiMatch0, '100.0%');
        assert.strictEqual(bio3dState.manifestSha, '39ef51ef98abe56eab1f1b2cd6c0cc4cf99ccfb4403483b83f7ea06f22f3406c');
        assert.strictEqual(bio3dState.statsAudit.seedCount, 256, 'Expected 256 seeds (42..297)');
        assert.strictEqual(bio3dState.statsAudit.firstSeed, 42);
        assert.strictEqual(bio3dState.statsAudit.lastSeed, 297);
        assert.strictEqual(bio3dState.statsAudit.allSpeciesHave256PerArm, true, 'Every species and arm must have 256 finite observations');
        assert.strictEqual(bio3dState.statsAudit.allSeedKeyOrderInvariant, true, 'Paired contrasts must be keyed by seed ID, not row position');
        assert.strictEqual(bio3dState.statsAudit.allCiMatchReference, true, 'Dynamically calculated 90% CIs must match radial_analyse.jl to 4 decimals');
        assert.strictEqual(bio3dState.statsAudit.allContrastsWithinEquivalenceBound, true, 'All 90% TOST CIs must lie strictly inside [-0.05, +0.05] r/R');
        console.log(`PASS [5/8]: Biofilms 3-D WebGL, MCS 0/100 arms, and 256-Seed 4-Arm Null Plot verified (${bio3dState.glWidth}x${bio3dState.glHeight}, MCS 0 match=${bio3dState.kpiMatch0}, ensemble=${bio3dState.ensWidth}x${bio3dState.ensHeight}).`);
        console.log(`PASS [6/8]: Biofilms 256-Seed Statistical Integrity verified (7 species x 4 arms x 256 seeds, seed-keyed pairing, TOST 90% CIs match radial_analyse.jl).`);
      }
    );

    // Session B: WebGL disabled (--disable-webgl) to verify exception-safe 2-D Slice fallback
    await withChromeSession(
      ['--disable-webgl', '--disable-webgl2'],
      port,
      9236,
      async evalJson => {
        await evalJson(`(() => { setView('nw'); return 'true'; })()`);
        await new Promise(r => setTimeout(r, 2500));
        const fallbackState = await evalJson(`(() => {
          const ifr = document.getElementById('iframeNw');
          const d = ifr.contentDocument;
          const w = ifr.contentWindow;
          const gl = d.getElementById('gl');
          const sl = d.getElementById('sl');
          return JSON.stringify({
            hasThree: !!w.THREE,
            glHidden: gl.hidden,
            slHidden: sl.hidden,
            slWidth: sl.width,
            slHeight: sl.height,
            m3dDisabled: d.getElementById('m3d').disabled,
            msliceActive: d.getElementById('mslice').classList.contains('on'),
            vtitle: d.getElementById('vtitle').textContent,
            kval: d.getElementById('kval').textContent,
            ntot: d.getElementById('ntot').textContent
          });
        })()`);
        assert.strictEqual(fallbackState.hasThree, true, 'Three.js must be loaded to test WebGLRenderer constructor failure');
        assert.strictEqual(fallbackState.glHidden, true, '3-D canvas must be hidden when WebGL fails');
        assert.strictEqual(fallbackState.slHidden, false, '2-D Slice canvas must be visible when WebGL fails');
        assert.ok(fallbackState.slWidth > 400 && fallbackState.slHeight > 350, `Expected sized 2-D Slice canvas, got ${fallbackState.slWidth}x${fallbackState.slHeight}`);
        assert.strictEqual(fallbackState.m3dDisabled, true, '3-D mode button must be disabled when WebGL fails');
        assert.strictEqual(fallbackState.msliceActive, true, 'Slice button must be active when WebGL fails');
        assert.strictEqual(fallbackState.vtitle, 'Cross-section');
        assert.notStrictEqual(fallbackState.kval, '\u2014', 'Tally k-eff must still compute in 2-D Slice fallback');
        assert.ok(!fallbackState.ntot.includes('(0 neutrons)'), `Expected live tally in fallback mode, got ${fallbackState.ntot}`);
        console.log(`PASS [6/7]: TECDOC-643 disabled-WebGL exception fallback verified (2-D Slice ${fallbackState.slWidth}x${fallbackState.slHeight}, k=${fallbackState.kval}, ${fallbackState.ntot}).`);

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
        console.log(`PASS [7/7]: Biofilms 3-D disabled-WebGL 2-D Slice fallback verified (${bioFallback.slWidth}x${bioFallback.slHeight}, sites=${bioFallback.kpiOcc}).`);
      }
    );
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('REGRESSION TEST FAILED:', err);
  process.exit(1);
});
