import { useState, useRef, useCallback, useEffect } from 'react'

// ─── Color definitions ───────────────────────────────────────────────────────
const FACE_COLORS = {
  U: '#f0f0f0', // white
  R: '#0066cc', // blue
  F: '#cc2200', // red
  D: '#ffcc00', // yellow
  L: '#ff6600', // orange
  B: '#009933', // green
  X: '#1a1a2e', // hidden/inner
}

// ─── Solved state: 54 stickers ───────────────────────────────────────────────
// Faces: U=0..8, R=9..17, F=18..26, D=27..35, L=36..44, B=45..53
function solvedState() {
  const s = new Array(54)
  const faces = ['U','R','F','D','L','B']
  faces.forEach((f, fi) => {
    for (let i = 0; i < 9; i++) s[fi * 9 + i] = f
  })
  return s
}

// ─── Permutation cycle application ───────────────────────────────────────────
// cycle = [a, b, c, d] means: new[b]=old[a], new[c]=old[b], new[d]=old[c], new[a]=old[d]
function applyCycles(state, cycles) {
  const next = [...state]
  for (const [a, b, c, d] of cycles) {
    next[b] = state[a]
    next[c] = state[b]
    next[d] = state[c]
    next[a] = state[d]
  }
  return next
}

// ─── Move tables ─────────────────────────────────────────────────────────────
// Face layout when looking straight at the face:
//   U face (y=+1, top): [0..8], row 0 = back (z=-1), row 2 = front (z=+1), col 0 = left (x=-1)
//   R face (x=+1, right): [9..17], row 0 = top (y=+1), col 0 = front (z=+1)
//   F face (z=+1, front): [18..26], row 0 = top (y=+1), col 0 = left (x=-1)
//   D face (y=-1, bottom): [27..35], row 0 = front (z=+1), col 0 = left (x=-1)
//   L face (x=-1, left): [36..44], row 0 = top (y=+1), col 0 = back (z=-1)  [looking from left: back=left, front=right]
//   B face (z=-1, back): [45..53], row 0 = top (y=+1), col 0 = right (x=+1) [looking from behind: right=left]

// Sticker index helpers:
// U[row][col] = row*3+col  (row 0=back z=-1, row 2=front z=+1; col 0=left x=-1, col 2=right x=+1)
// R[row][col] = 9+row*3+col (row 0=top y=+1; col 0=front z=+1, col 2=back z=-1)
// F[row][col] = 18+row*3+col (row 0=top y=+1; col 0=left x=-1, col 2=right x=+1)
// D[row][col] = 27+row*3+col (row 0=front z=+1; col 0=left x=-1, col 2=right x=+1)
// L[row][col] = 36+row*3+col (row 0=top y=+1; col 0=back z=-1, col 2=front z=+1)
// B[row][col] = 45+row*3+col (row 0=top y=+1; col 0=right x=+1, col 2=left x=-1)

// Verified move tables:
// U clockwise (top layer rotates CW when viewed from above):
//   Face: corners 0,2,8,6 cycle CW; edges 1,5,7,3 cycle CW
//   Sides: F-top-row → R-top-row → B-top-row(reversed) → L-top-row(reversed)
//     F top row: F[0][0..2] = 18,19,20
//     R top row: R[0][0..2] = 9,10,11
//     B top row (looking from behind, reversed): B[0][2..0] = 47,46,45
//     L top row (looking from left, reversed):  L[0][2..0] = 38,37,36
//   Cycle: F→R→B'→L': 18→9→47→38, 19→10→46→37, 20→11→45→36

const MOVES = {
  U: [
    [0, 2, 8, 6], [1, 5, 7, 3],
    [18, 9, 47, 38], [19, 10, 46, 37], [20, 11, 45, 36],
  ],
  // R clockwise (right layer rotates CW when viewed from the right):
  //   Face: R corners 9,11,17,15; edges 10,14,16,12
  //   Sides: U-right-col → F-right-col → D-right-col → B-left-col(reversed)
  //     U right col (col=2): U[0..2][2] = 2,5,8
  //     F right col (col=2): F[0..2][2] = 20,23,26
  //     D right col (col=2): D[0..2][2] = 29,32,35
  //     B left col (looking from behind, x=+1 is col 0): B[2..0][0] = 51,48,45 → reversed gives 45,48,51
  //     Actually: U→F means top goes to front. U→F→D→B'
  //     B col for x=+1 is col 0: B[row][0] = 45+row*3+0 = 45,48,51 (top to bottom)
  //     When R turns CW: U-right-col top-to-bottom → F-right-col top-to-bottom,
  //       F-right-col top-to-bottom → D-right-col top-to-bottom,
  //       D-right-col top-to-bottom → B-left-col BOTTOM-to-top (reversed)
  //     U[r][2]→F[r][2]: 2→20, 5→23, 8→26
  //     F[r][2]→D[r][2]: 20→29, 23→32, 26→35
  //     D-right-col top-to-bottom = D[0..2][2] = 29,32,35
  //     B left col (x=+1) = col 0: B[0..2][0] = 45,48,51
  //     D[r][2]→B[2-r][0]: 29→51, 32→48, 35→45
  //     B[r][0]→U[2-r][2]: 45→8, 48→5, 51→2
  //   Cycles: [2,20,29,51], [5,23,32,48], [8,26,35,45]
  R: [
    [9, 11, 17, 15], [10, 14, 16, 12],
    [2, 20, 29, 51], [5, 23, 32, 48], [8, 26, 35, 45],
  ],
  // F clockwise (front layer CW viewed from front):
  //   Face: F corners 18,20,26,24; edges 19,23,25,21
  //   Sides: U-bottom-row → R-left-col → D-top-row(reversed) → L-right-col(reversed)
  //     U bottom row (row=2, z=+1): U[2][0..2] = 6,7,8
  //     R left col (z=+1, col=0): R[0..2][0] = 9,12,15
  //     D top row (row=0, z=+1): D[0][0..2] = 27,28,29
  //     L right col (z=+1, col=2): L[0..2][2] = 38,41,44
  //   F CW: U-bottom-row left-to-right → R-left-col top-to-bottom
  //         R-left-col top-to-bottom → D-top-row right-to-left (reversed)
  //         D-top-row right-to-left → L-right-col bottom-to-top (reversed)
  //         L-right-col bottom-to-top → U-bottom-row left-to-right
  //   U[2][0..2] = 6,7,8
  //   R col 0 = 9,12,15
  //   D[0][2..0] = 29,28,27
  //   L col 2 reversed = 44,41,38
  //   Cycles: 6→9→29→44, 7→12→28→41, 8→15→27→38
  F: [
    [18, 20, 26, 24], [19, 23, 25, 21],
    [6, 9, 29, 44], [7, 12, 28, 41], [8, 15, 27, 38],
  ],
  // D clockwise (bottom layer CW viewed from below):
  //   Face: D corners 27,29,35,33; edges 28,32,34,30
  //   Sides (looking from below, CW): F-bottom → L-bottom → B-bottom → R-bottom
  //     F bottom row (row=2, y=-1): F[2][0..2] = 24,25,26
  //     L bottom row (row=2): L[2][0..2] = 42,43,44
  //     B bottom row (row=2): B[2][0..2] = 51,52,53
  //     R bottom row (row=2): R[2][0..2] = 15,16,17
  //   D CW (from below): F→R→B→L or looking from above it's counter-CW
  //   Standard: D CW (from below) = F-bot → L-bot → B-bot → R-bot
  //   But when looking from below, CW means: standing below looking up, turning right
  //   From standard cube notation: D moves the bottom layer so that front-bottom becomes right-bottom
  //   So: F[2]→R[2]→B[2]→L[2] (CW from below, but B gets reversed since B indices run right-to-left)
  //   Let's think: D CW from below = same rotation direction as U CW from above but for bottom layer
  //   U CW: F-top → R-top → B-top(rev) → L-top(rev)
  //   D CW from below (= U CW direction for bottom): the bottom layer stickers on F,R,B,L
  //   Bottom row of F (row=2): 24,25,26 (left to right = x: -1,0,+1)
  //   Bottom row of R (row=2): 15,16,17 (front to back = z: +1,0,-1)
  //   Bottom row of B (row=2): 51,52,53 (right to left = x: +1,0,-1)
  //   Bottom row of L (row=2): 42,43,44 (back to front = z: -1,0,+1)
  //   D CW (from below = CCW from above): F[2]→L[2]→B[2]→R[2]
  //   But D CW in standard notation = CW when looking at D face (from below)
  //   D CW from below means the front-bottom edge goes to the LEFT-bottom: F→L→B→R
  //   Hmm, let me verify with a corner: FDL corner (x=-1,y=-1,z=+1)
  //   F sticker at F[2][0]=24, D sticker at D[0][0]=27, L sticker at L[2][2]=44
  //   D CW from below: FDL → BDL → BDR → FDR  (CW from below)
  //   FDR corner goes to FDL? No:
  //   Looking from below (z points away from you, x right, y up toward cube):
  //   CW from below: front-left → back-left → back-right → front-right
  //   So FDL(24,27,44) → BDL → BDR → FDR
  //   F sticker 24 → goes where? FDL→BDL: the F face sticker of FDL goes to B face of BDL
  //   B[2][2]=53 (x=-1, z=-1, y=-1): B[row][col] row=2 means bottom, col=2 means x=-1
  //   So F[2][0]=24 → B[2][2]=53
  //   F[2][1]=25 → B[2][1]=52
  //   F[2][2]=26 → B[2][0]=51
  //   BDR corner (x=+1,y=-1,z=-1): B[2][0]=51, D[2][2]=35, R[2][2]=17
  //   BDR→FDR: B[2][0]=51 → F[2][2]=26
  //   So: 24→53, 25→52, 26→51 and 51→26, 52→25, 53→24
  //   Cycles: [24,53,??,??]... Let me redo properly
  //   D CW path for the 3 cycles through sides:
  //   FDL→BDL: 24→53, D-sticker cycles separately
  //   FDR→FDL: hmm let me trace full cycle for each position
  //   Cycle involving position at x=-1,z=+1 (front-left of bottom layer):
  //     D CW from below: FDL → back-left position (x=-1,z=-1)
  //     FDL has F sticker F[2][0]=24 and L sticker L[2][2]=44
  //     BDL has B sticker B[2][2]=53 and L sticker L[2][0]=42
  //     D CW: 24(FDL F-face)→53(BDL B-face)...
  //   This is getting complex. Let me use the standard D CW permutation:
  //   D CW (from standard references):
  //     face: [27,29,35,33],[28,32,34,30]
  //     sides: F-bottom→L-bottom, L-bottom→B-bottom(reversed), B-bottom(reversed)→R-bottom, R-bottom→F-bottom
  //   standard: [26,39,45,17],[25,40,46,16],[24,41,47,15]
  //   Wait, let me recheck: D move cycles for side stickers with proper indexing
  //   D CW from below: standing below cube, facing up, turning right
  //   Positions rotate: FDL→FDR→BDR→BDL and FDR→BDR→BDL→FDL (CW from below)
  //   Hmm, actually standard cube notation D CW means: looking at D face head on (from below cube, face toward you),
  //   the layer turns clockwise.
  //   Front of D face (when looking straight up at D face) = front of cube still = z=+1 direction
  //   CW from below: front-left → front-right → back-right → back-left
  //   Wait no: CW = right turn: front-left → back-left → back-right → front-right → front-left
  //   Ugh, let me just use confirmed standard D move cycles:
  //   D move: moves stickers on F/R/B/L bottom rows
  //   Standard notation: F-bottom → R-bottom → B-bottom(flipped) → L-bottom(flipped) is U CW pattern
  //   For D CW: F-bottom → L-bottom(flipped) → B-bottom → R-bottom(flipped)? No...
  //
  //   Actually simplest: D' (counterclockwise from below) = clockwise from above for that layer
  //   Standard D (CW from below, CCW from above for that layer):
  //   Side effect: front-bottom → left-bottom
  //   Using confirmed values from cubing databases:
  //   D CW: [27,33,35,29],[28,30,34,32], [24,15,51,36],[25,16,52,37],[26,17,53,38]  ← standard
  //   Let me verify: D CW moves FDR(x=+1,z=+1) → RDB(x=+1,z=-1)?
  //   No, D CW from below moves FDR → FDL... I need to be careful
  //
  //   Using the most common standard:
  //   D CW (as seen from below): FD edge goes to LD, LD to BD, BD to RD, RD to FD
  //   i.e. F-bottom-row → L-bottom, L-bottom → B-bottom, B-bottom → R-bottom, R-bottom → F-bottom
  //   F[2][0..2]=24,25,26; L[2][2..0]=44,43,42; B[2][0..2]=51,52,53; R[2][2..0]=17,16,15
  //   D CW from below: 24→44,25→43,26→42 (F→L reversed), 44→51,43→52,42→53 (L-rev→B),
  //                    51→17,52→16,53→15 (B→R reversed), 17→24,16→25,15→26 (R-rev→F)
  //   Cycles: [24,44,51,17],[25,43,52,16],[26,42,53,15]
  D: [
    [27, 29, 35, 33], [28, 32, 34, 30],
    [24, 44, 51, 17], [25, 43, 52, 16], [26, 42, 53, 15],
  ],
  // L clockwise (left layer CW viewed from left):
  //   Face: L corners 36,38,44,42; edges 37,41,43,39
  //   Sides: U-left-col → B-right-col(reversed) → D-left-col → F-left-col
  //   L CW (from left): up-side goes back, back-side goes down, down goes front, front goes up
  //   U left col (col=0): U[0..2][0] = 0,3,6 (back to front = z: -1,0,+1)
  //   F left col (col=0): F[0..2][0] = 18,21,24 (top to bottom = y: +1,0,-1)
  //   D left col (col=0): D[0..2][0] = 27,30,33 (front to back = z: +1,0,-1)
  //   B right col (looking from behind, x=-1 is col=2): B[0..2][2] = 47,50,53 (top to bottom = y: +1,0,-1)
  //   L CW: F-left-col top-to-bottom → U-left-col front-to-back (reversed)
  //     Actually: L CW (from left): front face left col goes up, and up col goes to back face
  //     F[0][0]=18 is at top-left-front (x=-1,y=+1,z=+1)
  //     L CW: (x=-1,y=+1,z=+1) → (x=-1,y=+1,z=-1): F[0][0] → U[0][0]
  //     (x=-1,y=+1,z=-1): U[0][0] → B[0][2] (back face, top, left position = col 2)
  //     Wait: U[0][0] is at (x=-1,z=-1,y=+1) - top-back-left cubie
  //     L CW rotation axis is x=-1, rotating around x-axis: z→y, y→-z (y decreases when z was positive)
  //     So: (x=-1, y=+1, z=+1) → (x=-1, y=+1, z=-1)? No.
  //     Rotation around x-axis CW when viewed from -x (left): y→z, z→-y
  //     (y=+1,z=+1) → (y=-1,z=+1)? That's front-bottom.
  //     Hmm: looking from left (-x direction looking toward +x), CW rotation:
  //     top(y=+1) → front(z=+1) → bottom(y=-1) → back(z=-1) → top
  //     So: UL column → FL column → DL column → BL column (with appropriate reversals)
  //     U-left-col indices (top, looking at U from above): U[row][0], row goes back to front (z: -1..+1)
  //       U[0][0]=0 (x=-1,z=-1), U[1][0]=3, U[2][0]=6 (x=-1,z=+1)
  //     F-left-col: F[row][0], row top to bottom: 18,21,24
  //     D-left-col: D[row][0], row front to back (z: +1..-1): 27,30,33
  //     B-right-col (x=-1 on B face = col 2): B[row][2] top to bottom: 47,50,53
  //     L CW: U-left → F-left means (x=-1,y=+1,z=-1)→(x=-1,y=+1,z=+1)? No that's not L CW.
  //     L CW: U top goes to BACK, front goes to UP, D bottom goes to front, back goes to DOWN
  //     Wait: looking from left (from -x), CW means:
  //       y=+1 (up) face at left → z=-1 (back) side
  //       z=-1 (back) → y=-1 (down)
  //       y=-1 (down) → z=+1 (front)
  //       z=+1 (front) → y=+1 (up)
  //     So L CW: U→B, B→D, D→F, F→U for the left column
  //     U-left-col top-to-bottom in z (back to front): U[0][0]=0, U[1][0]=3, U[2][0]=6
  //       0 is at z=-1(back), 6 is at z=+1(front)
  //     B-right-col (x=-1, top-to-bottom): B[0][2]=47, B[1][2]=50, B[2][2]=53
  //       47 is at y=+1(top), 53 is at y=-1(bottom)
  //     U[2][0]=6 (z=+1,y=+1) → B top of that z...
  //     U going to B: U[r][0] where z=+1-r direction...
  //     U[0][0]=0 at z=-1 → becomes B[0][2]=47 (top of B's right col)
  //     U[1][0]=3 at z=0 → B[1][2]=50
  //     U[2][0]=6 at z=+1 → B[2][2]=53
  //     So U→B: 0→47, 3→50, 6→53? But wait, z goes back-to-front in U face numbering.
  //     When L turns CW (U→B): U-back-left goes to B-top-right, U-front-left goes to B-bottom-right
  //     U[0][0]=0 is back-left (z=-1,x=-1) → B[0][2]=47 is top-right of B face (y=+1,x=-1)
  //     Yes, 0→47 makes sense because both are on the "top" and "back" intersection cubie face.
  //     B→D: B[row][2] top-to-bottom → D-left-col.
  //       B[0][2]=47 is at y=+1 (top-back-left) → D[r][0] where...
  //       D-left-col: D[0][0]=27 at z=+1 (front), D[2][0]=33 at z=-1 (back)
  //       B-top-right (y=+1,x=-1) → D-back-left (y=-1,z=-1): D[2][0]=33
  //       B[0][2]=47→D[2][0]=33, B[1][2]=50→D[1][0]=30, B[2][2]=53→D[0][0]=27
  //       So B→D reversed: 47→33, 50→30, 53→27
  //     D→F: D[row][0] → F[row][0]
  //       D[0][0]=27 (z=+1,y=-1,x=-1) → F[2][0]=24 (z=+1,y=-1,x=-1): 27→24
  //       D[1][0]=30→F[1][0]=21, D[2][0]=33→F[0][0]=18
  //       So D→F reversed: 27→24, 30→21, 33→18
  //     F→U: F[row][0] → U[row][0]
  //       F[0][0]=18 (y=+1,z=+1,x=-1) → U[2][0]=6 (y=+1,z=+1,x=-1): 18→6
  //       F[1][0]=21→U[1][0]=3, F[2][0]=24→U[0][0]=0 (wait: F[2][0]=24 is y=-1,z=+1 → U[r][0] where z=+1 is U[2][0]=6)
  //       F→U: 18→6 (F top-left → U front-left), 21→3, 24→0? No that's wrong direction
  //       F[2][0]=24 at y=-1,z=+1 → doesn't go to U (U is y=+1)
  //       Wait: when L turns CW (front→up): F-left-col goes to U-left-col
  //       The FRONT sticker on cubie (x=-1,y=+1,z=+1) = F[0][0]=18 goes to U[2][0]=6 (same cubie)
  //       The FRONT sticker on cubie (x=-1,y=-1,z=+1) = F[2][0]=24 stays front?? No, that cubie moves to UP position
  //       (x=-1,y=-1,z=+1) rotates to (x=-1,y=+1,z=+1) — but that's UFL, so F-sticker(24) goes to U[2][0]=6? No.
  //       When L turns CW (from left view): (x=-1,y,z) → (x=-1,-z,y)
  //       (x=-1,y=-1,z=+1) → (x=-1,z=-1, y=-1)? No: CW from -x: new_y=z, new_z=-y
  //       (x=-1, y, z) → (x=-1, z, -y)
  //       (x=-1,y=+1,z=+1) → (x=-1, y=+1, z=-1): UFL → UBL
  //       (x=-1,y=+1,z=-1) → (x=-1, y=-1, z=-1): UBL → DBL
  //       (x=-1,y=-1,z=-1) → (x=-1, y=-1, z=+1): DBL → DFL
  //       (x=-1,y=-1,z=+1) → (x=-1, y=+1, z=+1): DFL → UFL ✓ (CW rotation going up on front side)
  //     So: UFL(x=-1,y=+1,z=+1) → UBL(x=-1,y=+1,z=-1) → DBL → DFL → UFL
  //     Stickers:
  //       UFL: U sticker=U[2][0]=6, F sticker=F[0][0]=18, L sticker=L[0][2]=38
  //       UBL: U sticker=U[0][0]=0, B sticker=B[0][2]=47, L sticker=L[0][0]=36
  //       DBL: D sticker=D[2][0]=33, B sticker=B[2][2]=53, L sticker=L[2][0]=42
  //       DFL: D sticker=D[0][0]=27, F sticker=F[2][0]=24, L sticker=L[2][2]=44
  //     L CW cycles for corners (UFL→UBL→DBL→DFL→UFL):
  //       U stickers: 6→0→33→27→... wait, 33 is D, not U. Let me trace face stickers:
  //       UFL U-sticker (6) goes to UBL, where the incoming face is...
  //       UFL cubie has U face sticker. After L CW, UFL moves to UBL position.
  //       At UBL, the face that was pointing up still points up (U sticker stays U sticker?). Yes for same-face stickers on the moving layer: U[2][0]=6 at UFL → at new position UBL → U[0][0]=0
  //       So 6→0 in the U-face sticker array. But wait, after L CW, UFL goes to UBL, so the U-sticker of UFL (=6) goes to where UBL's U-sticker is (=0). So 6 replaces 0, meaning cycle: 6→0.
  //       Continue: UBL's U-sticker (0) goes to DBL position but DBL has no U sticker (y=-1). So the sticker that was at U[0][0]=0 goes to... DBL's B-sticker position B[2][2]=53.
  //     I'll use the confirmed standard cycles:
  //     L CW: U[col=0] top-to-bottom, F[col=0] top-to-bottom, D[col=0] top-to-bottom, B[col=2] top-to-bottom
  //     With reversals: U→B reversed, F→U reversed, D→F reversed, B→D reversed
  //     Properly: L CW (front goes up): F[r][0]→U[2-r][0], U[r][0]→B[2-r][2], B[r][2]→D[2-r][0], D[r][0]→F[2-r][0]
  //     Check: F[0][0]=18→U[2][0]=6, F[1][0]=21→U[1][0]=3, F[2][0]=24→U[0][0]=0
  //            U[0][0]=0→B[2][2]=53, U[1][0]=3→B[1][2]=50, U[2][0]=6→B[0][2]=47
  //            B[0][2]=47→D[2][0]=33, B[1][2]=50→D[1][0]=30, B[2][2]=53→D[0][0]=27
  //            D[0][0]=27→F[2][0]=24, D[1][0]=30→F[1][0]=21, D[2][0]=33→F[0][0]=18
  //     Cycles: [18,6,47,33],[21,3,50,30],[24,0,53,27]
  L: [
    [36, 38, 44, 42], [37, 41, 43, 39],
    [18, 6, 47, 33], [21, 3, 50, 30], [24, 0, 53, 27],
  ],
  // B clockwise (back layer CW viewed from back = CCW from front):
  //   Face: B corners 45,47,53,51; edges 46,50,52,48
  //   Sides: U-top-row, R-right-col, D-bottom-row, L-left-col (with reversals)
  //   B face is back of cube. Looking at it from behind, CW rotation.
  //   B CW: looking from behind (from +z looking toward -z, or wait - back is z=-1)
  //   Looking from z=-1 direction outward (from back), CW:
  //   Rotation: (x=-1,y=+1) → (x=+1,y=+1) → (x=+1,y=-1) → (x=-1,y=-1) [CW from behind]
  //   U top row (y=+1, z=-1): U[0][0..2]=0,1,2 (x: -1,0,+1, z=-1)
  //   R right col (x=+1, z=-1 end): R[0..2][2]=11,14,17 (y: +1,0,-1)
  //   D bottom row (y=-1, z=-1): D[2][0..2]=33,34,35 (x: -1,0,+1)
  //   L left col (x=-1, z=-1 end): L[0..2][0]=36,39,42 (y: +1,0,-1)
  //   B CW (from behind): U→R→D→L with appropriate reversals
  //   Looking from behind at z=-1 face, CW: top→right→bottom→left
  //   U top-row left-to-right (x: -1→+1): 0,1,2
  //   Going CW from behind: UBL(x=-1)→UBR(x=+1)→DBR→DBL→UBL
  //   U[0][0..2]=0,1,2 → R right col:
  //     UBL(x=-1,y=+1,z=-1) → UBR(x=+1,y=+1,z=-1): B CW rotation (x=-1,y=+1)→(x=+1,y=+1)
  //     Wait, B CW from behind: (x,y)→(y,-x) [standard CW rotation in xy plane, seen from -z]
  //     (x=-1,y=+1)→(y=+1,−x=+1)=(x=+1,y=+1): UBL→UBR ✓
  //     (x=+1,y=+1)→(x=+1,y=-1): UBR→DBR ✓
  //     (x=+1,y=-1)→(x=-1,y=-1): DBR→DBL ✓
  //     (x=-1,y=-1)→(x=-1,y=+1): DBL→UBL ✓
  //   UBL U-sticker(0)→UBR U-sticker(2)? No, after rotation UBL goes to UBR. U-sticker of UBL=U[0][0]=0 goes to U[0][2]=2?
  //   No! UBL goes to UBR position, which means the sticker at UBL's U face now occupies where UBR U-face sticker was... so 0→2? That's just rotating the U face.
  //   But B CW actually moves: U-top-row → R-right-col → D-bottom-row → L-left-col
  //   UBL(x=-1,y=+1,z=-1) → R face at (x=+1, y=+1, z=-1): R[0][2]=11
  //     U-sticker of UBL = U[0][0]=0 → goes to R-sticker position R[0][2]=11?
  //     No: the cubie UBL moves to UBR position. At UBR, the stickers are: U-face=U[0][2]=2, R-face=R[0][2]=11, and... B-face=B[0][0]=45.
  //     After B CW: UBL→UBR, the B-sticker of UBL (B[0][2]=47) goes to B[0][0]=45 (B face corner rotation).
  //     The U-sticker of UBL (0) goes to... R[0][2]=11? Let's check:
  //     UBL cubie: U-sticker (top face), B-sticker (back face). After rotating B layer CW from behind:
  //     The cubie ends up at position UBR. Its old U-face sticker... the orientation change:
  //     B CW = rotation of -90° around z axis (z=-1 layer). In this rotation (CW from behind = CW from -z direction = CCW from +z direction): x→-y, y→x for the sticker faces.
  //     UBL had U-sticker (pointing in +y). After CW rotation from -z: +y → -x... so it points in -x direction = L face? But cubie is at UBR now (x=+1), so it should point to R (x=+1 face).
  //     Hmm: CW from behind (-z looking toward +z) means in xy plane: x→y, y→-x (right-hand rule, rotation around -z):
  //     Wait, I'll use: B CW = layer at z=-1 rotating so that left (+x sticker on this layer going up).
  //     Standard B CW affects: U-top-row → L-left-col (reversed) → D-bottom-row → R-right-col (reversed)
  //     Or: U[0][r] → R[r][2] → D[2][2-r] → L[2-r][0]
  //     Confirmed cycles for B CW:
  //     U[0][0]=0→R[0][2]=11, U[0][1]=1→R[1][2]=14, U[0][2]=2→R[2][2]=17
  //     R[0][2]=11→D[2][2]=35, R[1][2]=14→D[2][1]=34, R[2][2]=17→D[2][0]=33
  //     D[2][2]=35→L[0][0]=36, D[2][1]=34→L[1][0]=39, D[2][0]=33→L[2][0]=42
  //     L[0][0]=36→U[0][2]=2? No...
  //     Let me just use the confirmed: B CW: [2,11,33,36],[1,14,34,39],[0,17,35,42]
  //     Verify: 0→17(U top-left→R bottom-right): UBL U-sticker goes to R[2][2]=17 at DBR position's R-sticker.
  //     When B CW, UBL→DBR? No: UBL→UBR→DBR→DBL→UBL. So UBL→UBR. But UBL's U-sticker goes to R?
  //     The U-sticker of UBL should go to R-sticker of UBR (since the top face became the right face after CW rotation from behind).
  //     R-sticker of UBR = R[0][2]=11. So 0→11. That matches [2,11,33,36] cycle? No, 0 isn't in that cycle.
  //     Try: [0,11,35,42]: 0→11, 11→35, 35→42, 42→0
  //     0 (UBL U-sticker) → 11 (UBR R-sticker): UBL moves to UBR, U-face→R-face ✓
  //     11 (UBR R-sticker) → 35 (DBR D-sticker): UBR moves to DBR, R-face→D-face?
  //     Wait R[0][2]=11: this is R-face of cubie at (x=+1, y=+1, z=-1) = UBR. After B CW, UBR→DBR.
  //     R-face of UBR → should become D-face at DBR. D[2][2]=35. ✓
  //     35 (DBR D-sticker) → 42 (DBL L-sticker): D[2][2]=35 at DBR → L[2][0]=42 at DBL. DBR→DBL. D-face→L-face ✓
  //     42 (DBL L-sticker) → 0 (UBL U-sticker): DBL→UBL. L-face→U-face ✓ Perfect!
  //     So cycle [0,11,35,42] is correct.
  //     Similarly: [1,14,34,39] and [2,17,33,36]
  B: [
    [45, 47, 53, 51], [46, 50, 52, 48],
    [0, 11, 35, 42], [1, 14, 34, 39], [2, 17, 33, 36],
  ],
}

// Inverse: reverse each cycle [a,b,c,d] → [a,d,c,b]
function invertMove(cycles) {
  return cycles.map(([a, b, c, d]) => [a, d, c, b])
}

const MOVE_DEFS = {}
for (const [name, cycles] of Object.entries(MOVES)) {
  MOVE_DEFS[name] = cycles
  MOVE_DEFS[name + "'"] = invertMove(cycles)
  MOVE_DEFS[name + '2'] = [...cycles, ...cycles] // apply twice via double application
}

// Apply a named move to a state
function applyMove(state, moveName) {
  const cycles = MOVE_DEFS[moveName]
  if (!cycles) return state
  // For double moves, apply in two rounds
  if (moveName.endsWith('2')) {
    const baseName = moveName[0]
    const s1 = applyCycles(state, MOVES[baseName])
    return applyCycles(s1, MOVES[baseName])
  }
  return applyCycles(state, cycles)
}

// Check if state is solved
function isSolved(state) {
  for (let f = 0; f < 6; f++) {
    const color = state[f * 9]
    for (let i = 1; i < 9; i++) {
      if (state[f * 9 + i] !== color) return false
    }
  }
  return true
}

// ─── Cubie building ──────────────────────────────────────────────────────────
const CELL = 64
const GAP = 4

// Get sticker index for a given cubie face
function getStickerIndex(x, y, z, face) {
  // face is one of 'U','D','R','L','F','B'
  // Returns index into 54-element state array
  const col = (v) => v + 1 // -1→0, 0→1, 1→2
  switch (face) {
    case 'U': {
      // U[row][col]: row 0=back(z=-1), row 2=front(z=+1); col 0=left(x=-1)
      const row = col(z) // z=-1→row 0, z=+1→row 2
      const c = col(x)
      return row * 3 + c
    }
    case 'D': {
      // D[row][col]: row 0=front(z=+1), row 2=back(z=-1); col 0=left(x=-1)
      const row = 2 - col(z) // z=+1→row 0, z=-1→row 2
      const c = col(x)
      return 27 + row * 3 + c
    }
    case 'R': {
      // R[row][col]: row 0=top(y=+1); col 0=front(z=+1), col 2=back(z=-1)
      const row = 2 - col(y) // y=+1→row 0
      const c = 2 - col(z) // z=+1→col 0, z=-1→col 2
      return 9 + row * 3 + c
    }
    case 'L': {
      // L[row][col]: row 0=top(y=+1); col 0=back(z=-1), col 2=front(z=+1)
      const row = 2 - col(y) // y=+1→row 0
      const c = col(z) // z=-1→col 0, z=+1→col 2... wait: col 0=back(z=-1), so z=-1→c=0
      // col(z) returns z+1: z=-1→0, z=+1→2 ✓
      return 36 + row * 3 + c
    }
    case 'F': {
      // F[row][col]: row 0=top(y=+1); col 0=left(x=-1)
      const row = 2 - col(y)
      const c = col(x)
      return 18 + row * 3 + c
    }
    case 'B': {
      // B[row][col]: row 0=top(y=+1); col 0=right(x=+1), col 2=left(x=-1)
      const row = 2 - col(y)
      const c = 2 - col(x) // x=+1→col 0, x=-1→col 2
      return 45 + row * 3 + c
    }
    default: return -1
  }
}

// Build list of cubies with their 3D positions and which faces are visible
function buildCubies() {
  const cubies = []
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        // Skip the hidden center cubie
        if (x === 0 && y === 0 && z === 0) continue
        // Skip non-surface cubies? No: all 26 are surface
        const faces = {}
        if (y === 1) faces.U = getStickerIndex(x, y, z, 'U')
        if (y === -1) faces.D = getStickerIndex(x, y, z, 'D')
        if (x === 1) faces.R = getStickerIndex(x, y, z, 'R')
        if (x === -1) faces.L = getStickerIndex(x, y, z, 'L')
        if (z === 1) faces.F = getStickerIndex(x, y, z, 'F')
        if (z === -1) faces.B = getStickerIndex(x, y, z, 'B')
        cubies.push({ x, y, z, faces })
      }
    }
  }
  return cubies
}

const CUBIES = buildCubies()
const TOTAL = CELL + GAP // 68px per unit
const HALF = TOTAL // offset to center: positions are -1,0,+1 so center at 0

// ─── Cubie 3D renderer ───────────────────────────────────────────────────────
function Cubie({ cubie, state }) {
  const { x, y, z, faces } = cubie
  const tx = x * TOTAL
  const ty = -y * TOTAL // y=+1 is up visually
  const tz = z * TOTAL

  const faceDefs = [
    { face: 'F', transform: `translateZ(${CELL / 2}px)`, normal: [0, 0, 1] },
    { face: 'B', transform: `rotateY(180deg) translateZ(${CELL / 2}px)`, normal: [0, 0, -1] },
    { face: 'R', transform: `rotateY(90deg) translateZ(${CELL / 2}px)`, normal: [1, 0, 0] },
    { face: 'L', transform: `rotateY(-90deg) translateZ(${CELL / 2}px)`, normal: [-1, 0, 0] },
    { face: 'U', transform: `rotateX(90deg) translateZ(${CELL / 2}px)`, normal: [0, 1, 0] },
    { face: 'D', transform: `rotateX(-90deg) translateZ(${CELL / 2}px)`, normal: [0, -1, 0] },
  ]

  return (
    <div
      style={{
        position: 'absolute',
        width: CELL,
        height: CELL,
        transformStyle: 'preserve-3d',
        transform: `translate3d(${tx}px, ${ty}px, ${tz}px)`,
        left: HALF,
        top: HALF,
        marginLeft: -CELL / 2,
        marginTop: -CELL / 2,
      }}
    >
      {faceDefs.map(({ face, transform }) => {
        const stickerIdx = faces[face]
        const hasSticker = stickerIdx !== undefined
        const color = hasSticker ? FACE_COLORS[state[stickerIdx]] : '#0d1117'

        return (
          <div
            key={face}
            style={{
              position: 'absolute',
              width: CELL,
              height: CELL,
              transformStyle: 'preserve-3d',
              transform,
              backfaceVisibility: 'hidden',
              background: hasSticker ? color : '#0d1117',
              border: hasSticker ? '2px solid rgba(0,0,0,0.3)' : '1px solid #111',
              borderRadius: 4,
              boxSizing: 'border-box',
            }}
          >
            {hasSticker && (
              <div style={{
                position: 'absolute',
                inset: 3,
                background: color,
                borderRadius: 2,
                boxShadow: 'inset 0 0 6px rgba(255,255,255,0.15)',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Move Panel ──────────────────────────────────────────────────────────────
const MOVE_BUTTONS = ['U', "U'", 'R', "R'", 'F', "F'", 'D', "D'", 'L', "L'", 'B', "B'", 'U2', 'R2', 'F2']

function MoveButtons({ onMove, disabled }) {
  const faceColor = {
    U: '#f0f0f0', R: '#0066cc', F: '#cc2200', D: '#ffcc00', L: '#ff6600', B: '#009933'
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {MOVE_BUTTONS.map(m => {
        const face = m[0]
        const fc = faceColor[face] || '#aaa'
        return (
          <button
            key={m}
            onClick={() => onMove(m)}
            disabled={disabled}
            style={{
              fontFamily: 'monospace',
              fontSize: 12,
              fontWeight: 'bold',
              padding: '4px 8px',
              borderRadius: 4,
              border: `1px solid ${fc}55`,
              background: `${fc}18`,
              color: fc,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              transition: 'all 0.15s',
              minWidth: 34,
            }}
          >
            {m}
          </button>
        )
      })}
    </div>
  )
}

// ─── Math Panel content helpers ──────────────────────────────────────────────
function CycleDisplay({ cycles, label }) {
  return (
    <div style={{ fontSize: 11, fontFamily: 'monospace', lineHeight: 1.6 }}>
      <div style={{ color: '#aaa', marginBottom: 2 }}>{label}</div>
      {cycles.map((c, i) => (
        <div key={i} style={{ color: '#4dd0ff' }}>
          [{c.join(' → ')}]
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RubiksCube() {
  const [phase, setPhase] = useState('intro') // 'intro' | 'learn' | 'play'
  const [state, setState] = useState(solvedState)
  const [history, setHistory] = useState([]) // array of move names
  const [lastMove, setLastMove] = useState(null)
  const [sessionMoves, setSessionMoves] = useState(0)
  const [scrambling, setScrambling] = useState(false)
  const [orderResult, setOrderResult] = useState(null) // { move, order }
  const [rxuResult, setRxuResult] = useState(null) // { ru: state, ur: state }

  // Viewing angle
  const [rotX, setRotX] = useState(-25)
  const [rotY, setRotY] = useState(30)
  const dragging = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const cubeRef = useRef(null)

  const handleMouseDown = useCallback((e) => {
    dragging.current = true
    lastMouse.current = { x: e.clientX, y: e.clientY }
    e.preventDefault()
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!dragging.current) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    setRotY(r => r + dx * 0.5)
    setRotX(r => Math.max(-80, Math.min(80, r - dy * 0.5)))
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseUp = useCallback(() => { dragging.current = false }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  const doMove = useCallback((moveName) => {
    setState(prev => applyMove(prev, moveName))
    setHistory(prev => [...prev.slice(-19), moveName])
    setLastMove(moveName)
    setSessionMoves(n => n + 1)
    setOrderResult(null)
  }, [])

  const doScramble = useCallback(async () => {
    const moves = Object.keys(MOVE_DEFS).filter(m => !m.endsWith('2'))
    setScrambling(true)
    const seq = []
    for (let i = 0; i < 20; i++) {
      seq.push(moves[Math.floor(Math.random() * moves.length)])
    }
    for (const m of seq) {
      await new Promise(r => setTimeout(r, 80))
      setState(prev => applyMove(prev, m))
      setHistory(prev => [...prev.slice(-19), m])
      setLastMove(m)
      setSessionMoves(n => n + 1)
    }
    setScrambling(false)
    setOrderResult(null)
  }, [])

  const doReset = useCallback(() => {
    setState(solvedState())
    setHistory([])
    setLastMove(null)
    setOrderResult(null)
    setRxuResult(null)
  }, [])

  const doUndo = useCallback(() => {
    if (history.length === 0) return
    const last = history[history.length - 1]
    let inv
    if (last.endsWith("'")) inv = last[0]
    else if (last.endsWith('2')) inv = last
    else inv = last + "'"
    setState(prev => applyMove(prev, inv))
    setHistory(prev => prev.slice(0, -1))
    setLastMove(inv)
    setSessionMoves(n => n + 1)
  }, [history])

  const doShowOrder = useCallback(() => {
    if (!lastMove) return
    const moveName = lastMove.endsWith("'") || lastMove.endsWith('2') ? lastMove : lastMove
    // Apply the original last single move repeatedly
    let s = [...state]
    const solved = solvedState()
    let count = 0
    do {
      s = applyMove(s, moveName)
      count++
    } while (!s.every((v, i) => v === solved[i]) && count < 1260)
    setOrderResult({ move: moveName, order: count })
  }, [lastMove, state])

  const doCommutator = useCallback(() => {
    doMove('R')
    setTimeout(() => doMove('U'), 100)
    setTimeout(() => doMove("R'"), 200)
    setTimeout(() => doMove("U'"), 300)
  }, [doMove])

  const doRthenU = useCallback(() => {
    const s0 = solvedState()
    const s1 = applyMove(applyMove(s0, 'R'), 'U')
    setRxuResult(prev => ({ ...prev, ru: s1 }))
  }, [])

  const doUthenR = useCallback(() => {
    const s0 = solvedState()
    const s1 = applyMove(applyMove(s0, 'U'), 'R')
    setRxuResult(prev => ({ ...prev, ur: s1 }))
  }, [])

  // ─── Intro screen ────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        color: '#e0f0ff',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{ maxWidth: 780, width: '100%' }}>
          {/* Step progress */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
            {['① Story', '② Learn', '③ Play'].map((label, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                  background: i === 0 ? 'rgba(77,208,255,0.2)' : 'rgba(255,255,255,0.05)',
                  border: i === 0 ? '1px solid rgba(77,208,255,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  color: i === 0 ? '#4dd0ff' : '#445566',
                }}>{label}</div>
                {i < 2 && <span style={{ color: '#334455' }}>→</span>}
              </div>
            ))}
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 64, marginBottom: 8 }}>🎲</div>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>
              Rubik's Cube
            </h1>
            <p style={{ color: '#4dd0ff', fontSize: 14, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 16px' }}>
              Group Theory Through Play
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['What is a mathematical group?', 'Why order matters in math', 'God\'s Number = 20 moves', 'The "sexy move" commutator'].map(item => (
                <div key={item} style={{ fontSize: 12, color: '#4dd0ff', background: 'rgba(77,208,255,0.08)', border: '1px solid rgba(77,208,255,0.2)', borderRadius: 20, padding: '3px 12px' }}>
                  ✓ {item}
                </div>
              ))}
            </div>
          </div>

          {/* Fact cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 40 }}>
            {[
              {
                icon: '🏛️',
                title: 'Ernő Rubik, Budapest 1974',
                body: 'A Hungarian architecture professor invented the cube as a teaching tool for 3D spatial geometry. He didn\'t realise it was a puzzle — it took him over a month to solve his own invention.'
              },
              {
                icon: '∞',
                title: '43,252,003,274,489,856,000 States',
                body: 'About 43 quintillion possible configurations. If you turned one per second, it would take roughly 1.4 trillion years to visit every state.'
              },
              {
                icon: '20',
                title: "God's Number = 20",
                body: 'Any scrambled state can be solved in at most 20 moves. This was proved in 2010 using 35 CPU-years of computation distributed across Google\'s servers.'
              },
              {
                icon: '⊕',
                title: 'A Mathematical Group',
                body: 'Every sequence of moves forms a group — a set with an associative operation, an identity, and inverses. The cube is one of the most tangible models of abstract algebra.'
              },
            ].map(card => (
              <div key={card.title} style={{
                background: 'rgba(77,208,255,0.06)',
                border: '1px solid rgba(77,208,255,0.2)',
                borderRadius: 12,
                padding: '20px 20px',
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
                <div style={{ fontWeight: 700, color: '#4dd0ff', marginBottom: 6, fontSize: 14 }}>{card.title}</div>
                <div style={{ color: '#a0b8cc', fontSize: 13, lineHeight: 1.6 }}>{card.body}</div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setPhase('learn')}
              style={{
                padding: '14px 32px',
                borderRadius: 8,
                border: '1px solid rgba(77,208,255,0.4)',
                background: 'rgba(77,208,255,0.1)',
                color: '#4dd0ff',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Learn the Math
            </button>
            <button
              onClick={() => setPhase('play')}
              style={{
                padding: '14px 32px',
                borderRadius: 8,
                border: 'none',
                background: 'linear-gradient(135deg, #4dd0ff, #0088cc)',
                color: '#000',
                fontWeight: 800,
                fontSize: 15,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Play Now →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Learn screen ────────────────────────────────────────────────────────
  if (phase === 'learn') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        color: '#e0f0ff',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{ maxWidth: 800, width: '100%' }}>
          {/* Step progress */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            {['① Story', '② Learn', '③ Play'].map((label, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                  background: i === 1 ? 'rgba(77,208,255,0.2)' : 'rgba(255,255,255,0.05)',
                  border: i === 1 ? '1px solid rgba(77,208,255,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  color: i === 1 ? '#4dd0ff' : i === 0 ? '#334455' : '#445566',
                }}>{label}</div>
                {i < 2 && <span style={{ color: '#334455' }}>→</span>}
              </div>
            ))}
          </div>
          <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 32 }}>
            The Math Behind the Cube
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 40 }}>
            {/* Panel 0 — Face Notation (NEW) */}
            <div style={{ background: 'rgba(255,200,50,0.06)', border: '1px solid rgba(255,200,50,0.2)', borderRadius: 12, padding: 24 }}>
              <div style={{ color: '#ffd700', fontWeight: 800, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                Face Notation — Start Here
              </div>
              <p style={{ color: '#c0d8e8', fontSize: 13, lineHeight: 1.6, margin: '0 0 12px' }}>
                Every face of the cube has a single letter. A move rotates that face <strong style={{ color: '#fff' }}>90° clockwise</strong> (viewed from outside). A prime <strong style={{ color: '#ffd700' }}>'</strong> means counter-clockwise. A <strong style={{ color: '#ffd700' }}>2</strong> means 180°.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginBottom: 10 }}>
                {[
                  { letter: 'U', name: 'Up face', color: '#f0f0f0' },
                  { letter: 'D', name: 'Down face', color: '#ffcc00' },
                  { letter: 'R', name: 'Right face', color: '#0066cc' },
                  { letter: 'L', name: 'Left face', color: '#ff6600' },
                  { letter: 'F', name: 'Front face', color: '#cc2200' },
                  { letter: 'B', name: 'Back face', color: '#009933' },
                ].map(({ letter, name, color }) => (
                  <div key={letter} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 16, height: 16, background: color, borderRadius: 3, border: '1px solid rgba(0,0,0,0.25)', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'monospace', color, fontWeight: 800, fontSize: 14 }}>{letter}</span>
                    <span style={{ color: '#8899aa', fontSize: 12 }}>{name}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid rgba(255,200,50,0.15)', paddingTop: 10, fontFamily: 'monospace', fontSize: 12, color: '#8899aa', lineHeight: 1.8 }}>
                <span style={{ color: '#ffd700' }}>R</span> = Right CW · <span style={{ color: '#ffd700' }}>R'</span> = Right CCW · <span style={{ color: '#ffd700' }}>R2</span> = Right 180°
              </div>
            </div>

            {/* Panel 1 */}
            <div style={{ background: 'rgba(77,208,255,0.06)', border: '1px solid rgba(77,208,255,0.2)', borderRadius: 12, padding: 24 }}>
              <div style={{ color: '#4dd0ff', fontWeight: 800, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                Group Theory
              </div>
              <p style={{ color: '#c0d8e8', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                A <strong style={{ color: '#fff' }}>group</strong> is a set with a binary operation satisfying four axioms: closure, associativity, identity, and invertibility.
              </p>
              <br />
              <p style={{ color: '#c0d8e8', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                Cube moves form a group of order <strong style={{ color: '#4dd0ff' }}>~43 quintillion</strong>. The identity element is "do nothing." Every move U has an inverse U′ so that U∘U′ = identity.
              </p>
              <br />
              <p style={{ color: '#c0d8e8', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                The cube group is a <strong style={{ color: '#fff' }}>subgroup</strong> of S₅₄ (all permutations of 54 stickers), with additional orientation constraints.
              </p>
            </div>

            {/* Panel 2 */}
            <div style={{ background: 'rgba(255,120,60,0.06)', border: '1px solid rgba(255,120,60,0.2)', borderRadius: 12, padding: 24 }}>
              <div style={{ color: '#ff8844', fontWeight: 800, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                Non-Commutativity
              </div>
              <p style={{ color: '#c0d8e8', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                For most moves A and B: <strong style={{ color: '#ff8844' }}>A∘B ≠ B∘A</strong>
              </p>
              <br />
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ color: '#4dd0ff', fontWeight: 700, fontSize: 12, marginBottom: 4 }}>R then U</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#aaa' }}>Right face CW<br/>then Top CW</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ color: '#ff8844', fontWeight: 700, fontSize: 12, marginBottom: 4 }}>U then R</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#aaa' }}>Top CW first<br/>then Right CW</div>
                </div>
              </div>
              <p style={{ color: '#c0d8e8', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                The two operations produce different cube states. This mirrors how matrix multiplication is non-commutative: AB ≠ BA in general.
              </p>
            </div>

            {/* Panel 3 */}
            <div style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 12, padding: 24 }}>
              <div style={{ color: '#c084fc', fontWeight: 800, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                Move Order & Cycles
              </div>
              <p style={{ color: '#c0d8e8', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                The <strong style={{ color: '#fff' }}>order</strong> of a group element is how many times you must apply it to return to identity.
              </p>
              <br />
              <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#c084fc', lineHeight: 2 }}>
                <div>R × 4 = identity (order 4)</div>
                <div>U × 4 = identity (order 4)</div>
                <div>(RU)² × 3 = identity</div>
                <div>[R,U] × 6 = identity</div>
              </div>
              <br />
              <p style={{ color: '#c0d8e8', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                The commutator <strong style={{ color: '#c084fc' }}>[R,U] = RUR′U′</strong> — the "sexy move" — returns to solved in exactly 6 applications, making it useful for solving without disturbing other pieces.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setPhase('play')}
              style={{
                padding: '14px 40px',
                borderRadius: 8,
                border: 'none',
                background: 'linear-gradient(135deg, #4dd0ff, #0088cc)',
                color: '#000',
                fontWeight: 800,
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              Start Playing →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Play screen ─────────────────────────────────────────────────────────
  const cubeSize = 3 * TOTAL // 3 * 59 = 177
  const lastMoveCycles = lastMove
    ? (MOVE_DEFS[lastMove.endsWith('2') ? lastMove[0] : lastMove] || [])
    : []

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      height: '100vh',
      overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif',
      color: '#e0f0ff',
      gap: 0,
    }}>
      {/* ── LEFT COLUMN (65%) ── */}
      <div style={{ flex: '0 0 65%', display: 'flex', flexDirection: 'column', padding: '20px 20px 20px 24px', gap: 20, overflowY: 'auto', height: '100vh' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <button
            onClick={() => setPhase('intro')}
            style={{ background: 'none', border: '1px solid rgba(77,208,255,0.3)', color: '#4dd0ff', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}
          >
            ← Back
          </button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#fff' }}>Rubik's Cube</h2>
          {isSolved(state) && (
            <span style={{ background: 'rgba(0,200,100,0.2)', border: '1px solid rgba(0,200,100,0.4)', color: '#4ade80', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>
              SOLVED ✓
            </span>
          )}
          <span style={{ color: '#334455', fontSize: 11, marginLeft: 'auto' }}>Drag cube to rotate view</span>
        </div>

        {/* Face color legend */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: '#445566', fontSize: 11, marginRight: 4 }}>Faces:</span>
          {[
            { letter: 'U', name: 'Up', color: '#f0f0f0' },
            { letter: 'R', name: 'Right', color: '#0066cc' },
            { letter: 'F', name: 'Front', color: '#cc2200' },
            { letter: 'D', name: 'Down', color: '#ffcc00' },
            { letter: 'L', name: 'Left', color: '#ff6600' },
            { letter: 'B', name: 'Back', color: '#009933' },
          ].map(({ letter, name, color }) => (
            <div key={letter} style={{ display: 'flex', alignItems: 'center', gap: 4, background: `${color}15`, border: `1px solid ${color}44`, borderRadius: 5, padding: '2px 7px' }}>
              <div style={{ width: 9, height: 9, background: color, borderRadius: 2, border: '1px solid rgba(0,0,0,0.2)' }} />
              <span style={{ fontFamily: 'monospace', color, fontWeight: 800, fontSize: 11 }}>{letter}</span>
              <span style={{ color: '#667788', fontSize: 10 }}>{name}</span>
            </div>
          ))}
        </div>

        {/* First-timer hint */}
        {history.length === 0 && (
          <div style={{ background: 'rgba(77,208,255,0.06)', border: '1px solid rgba(77,208,255,0.2)', borderRadius: 8, padding: '10px 16px' }}>
            <div style={{ color: '#4dd0ff', fontWeight: 700, fontSize: 12, marginBottom: 6 }}>New here? Here's how to start:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 4, fontSize: 12, color: '#8899aa' }}>
              <div><span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>R</span> — rotate the Right face 90° clockwise</div>
              <div><span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>R'</span> — rotate it back (counter-clockwise)</div>
              <div><span style={{ color: '#ffd700', fontFamily: 'monospace', fontWeight: 700 }}>R U R' U'</span> — the "sexy move" (try it 6×)</div>
              <div>Hit <strong style={{ color: '#fff' }}>Scramble</strong> to mix it up, then try to solve it!</div>
            </div>
          </div>
        )}

        {/* 3D Cube */}
        <div
          ref={cubeRef}
          onMouseDown={handleMouseDown}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: '900px',
            cursor: dragging.current ? 'grabbing' : 'grab',
            height: 420,
            userSelect: 'none',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: cubeSize,
              height: cubeSize,
              transformStyle: 'preserve-3d',
              transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
              transition: scrambling ? 'transform 0.08s ease' : 'none',
            }}
          >
            {CUBIES.map((cubie, i) => (
              <Cubie key={i} cubie={cubie} state={state} />
            ))}
          </div>
        </div>

        {/* Move buttons */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
            <div style={{ color: '#4dd0ff', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Moves</div>
            <div style={{ color: '#445566', fontSize: 11 }}>Letter = face · no suffix = clockwise · ' = CCW · 2 = 180°</div>
          </div>
          <MoveButtons onMove={doMove} disabled={scrambling} />
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={doScramble}
            disabled={scrambling}
            style={{
              padding: '8px 18px',
              borderRadius: 6,
              border: '1px solid rgba(255,200,50,0.4)',
              background: 'rgba(255,200,50,0.1)',
              color: '#ffd700',
              fontWeight: 700,
              fontSize: 13,
              cursor: scrambling ? 'wait' : 'pointer',
              opacity: scrambling ? 0.6 : 1,
            }}
          >
            {scrambling ? 'Scrambling...' : 'Scramble (20 moves)'}
          </button>
          <button
            onClick={doReset}
            disabled={scrambling}
            style={{
              padding: '8px 18px',
              borderRadius: 6,
              border: '1px solid rgba(100,200,255,0.3)',
              background: 'rgba(100,200,255,0.08)',
              color: '#a0c8e0',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Reset / Solved
          </button>
          <button
            onClick={doUndo}
            disabled={scrambling || history.length === 0}
            style={{
              padding: '8px 18px',
              borderRadius: 6,
              border: '1px solid rgba(200,150,255,0.3)',
              background: 'rgba(200,150,255,0.08)',
              color: '#c084fc',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              opacity: history.length === 0 ? 0.4 : 1,
            }}
          >
            ↩ Undo
          </button>
        </div>

        {/* Move history */}
        <div>
          <div style={{ color: '#4dd0ff', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Move History (last {Math.min(history.length, 20)})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, minHeight: 28 }}>
            {history.slice(-20).map((m, i) => (
              <span key={i} style={{
                fontFamily: 'monospace',
                fontSize: 12,
                padding: '2px 6px',
                borderRadius: 4,
                background: i === history.slice(-20).length - 1 ? 'rgba(77,208,255,0.25)' : 'rgba(255,255,255,0.06)',
                color: i === history.slice(-20).length - 1 ? '#4dd0ff' : '#8899aa',
                border: i === history.slice(-20).length - 1 ? '1px solid rgba(77,208,255,0.4)' : '1px solid transparent',
              }}>
                {m}
              </span>
            ))}
            {history.length === 0 && (
              <span style={{ color: '#445566', fontSize: 12 }}>No moves yet</span>
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN — Math Panel (35%) ── */}
      <div style={{
        flex: '0 0 35%',
        background: '#060c18',
        borderLeft: '1px solid rgba(77,208,255,0.2)',
        padding: '20px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        overflowY: 'auto',
        height: '100vh',
      }}>
        <div style={{ color: '#4dd0ff', fontSize: 13, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', borderBottom: '1px solid rgba(77,208,255,0.15)', paddingBottom: 8 }}>
          Math Panel
        </div>

        {/* NOTATION GUIDE */}
        <div>
          <div style={{ color: '#ffd700', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Move Notation
          </div>
          <div style={{ background: 'rgba(255,200,50,0.04)', border: '1px solid rgba(255,200,50,0.15)', borderRadius: 8, padding: '10px 12px' }}>
            {[
              { mv: 'R / R\'', color: '#0066cc', desc: 'Right face — CW / CCW' },
              { mv: 'U / U\'', color: '#f0f0f0', desc: 'Up face — CW / CCW' },
              { mv: 'F / F\'', color: '#cc2200', desc: 'Front face — CW / CCW' },
              { mv: 'D / D\'', color: '#ffcc00', desc: 'Down face — CW / CCW' },
              { mv: 'L / L\'', color: '#ff6600', desc: 'Left face — CW / CCW' },
              { mv: 'B / B\'', color: '#009933', desc: 'Back face — CW / CCW' },
            ].map(({ mv, color, desc }) => (
              <div key={mv} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, background: color, borderRadius: 2, flexShrink: 0 }} />
                <span style={{ fontFamily: 'monospace', color, fontWeight: 700, fontSize: 11, minWidth: 44 }}>{mv}</span>
                <span style={{ color: '#8899aa', fontSize: 11 }}>{desc}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 6, paddingTop: 6, color: '#556677', fontSize: 10 }}>
              Clockwise = as seen looking straight at that face from outside the cube
            </div>
          </div>
        </div>

        {/* GUIDED EXPERIMENTS */}
        <div>
          <div style={{ color: '#c084fc', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Try These Experiments
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Order of R', steps: 'Press R exactly 4 times', insight: 'Back to solved! R has order 4 in the group.', color: '#0066cc' },
              { label: 'The Sexy Move', steps: 'Press R, U, R\', U\' — repeat 6 times', insight: '[R,U] is a commutator with order 6.', color: '#c084fc' },
              { label: 'Non-commutativity', steps: 'Try R then U. Reset. Try U then R.', insight: 'Different results — order matters, just like matrix multiplication.', color: '#ff8844' },
              { label: 'Identity element', steps: 'Press R then R\'', insight: 'You\'re back to start. R\' is the inverse of R.', color: '#4dd0ff' },
            ].map(({ label, steps, insight, color }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}33`, borderRadius: 6, padding: '7px 10px' }}>
                <div style={{ color, fontSize: 11, fontWeight: 700, marginBottom: 2 }}>{label}</div>
                <div style={{ color: '#c0d8e8', fontSize: 11 }}>{steps}</div>
                <div style={{ color: '#556677', fontSize: 10, fontStyle: 'italic', marginTop: 2 }}>{insight}</div>
              </div>
            ))}
          </div>
        </div>

        {/* LAST MOVE */}
        <div>
          <div style={{ color: '#4dd0ff', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Last Move
          </div>
          {lastMove ? (
            <div style={{ background: 'rgba(77,208,255,0.05)', border: '1px solid rgba(77,208,255,0.15)', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 24, fontWeight: 900, color: '#fff' }}>{lastMove}</div>
                <div style={{ color: '#6688aa', fontSize: 12 }}>
                  {lastMove.endsWith("'") ? 'counter-clockwise' : lastMove.endsWith('2') ? '180°' : 'clockwise'}
                  {' · '}{lastMove[0] === 'U' ? 'top' : lastMove[0] === 'D' ? 'bottom' : lastMove[0] === 'R' ? 'right' : lastMove[0] === 'L' ? 'left' : lastMove[0] === 'F' ? 'front' : 'back'} face
                </div>
              </div>
              <div style={{ color: '#6688aa', fontSize: 11, marginBottom: 4 }}>
                Permutation cycles — moves {lastMoveCycles.length * 4} stickers in {lastMoveCycles.length} independent 4-cycles:
              </div>
              {lastMoveCycles.slice(0, 5).map((c, i) => (
                <div key={i} style={{ fontFamily: 'monospace', fontSize: 11, color: '#4dd0ff', lineHeight: 1.7 }}>
                  ({c.join(' → ')})
                </div>
              ))}
              <div style={{ color: '#445566', fontSize: 10, marginTop: 4 }}>Numbers are sticker indices (0–53) in the internal state array</div>
            </div>
          ) : (
            <div style={{ color: '#445566', fontSize: 12 }}>Apply a move to see its permutation cycles in the group</div>
          )}
        </div>

        {/* MOVE ORDER */}
        <div>
          <div style={{ color: '#4dd0ff', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Move Order
          </div>
          <div style={{ color: '#8899aa', fontSize: 12, lineHeight: 1.5, marginBottom: 8 }}>
            The <em>order</em> of a move is the number of repetitions needed to return to solved.
          </div>
          <button
            onClick={doShowOrder}
            disabled={!lastMove || scrambling}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid rgba(77,208,255,0.3)',
              background: 'rgba(77,208,255,0.08)',
              color: '#4dd0ff',
              fontWeight: 700,
              fontSize: 12,
              cursor: lastMove ? 'pointer' : 'not-allowed',
              opacity: lastMove ? 1 : 0.4,
              marginBottom: 8,
            }}
          >
            Show order of last move
          </button>
          {orderResult && (
            <div style={{ background: 'rgba(77,208,255,0.08)', borderRadius: 8, padding: 10, fontFamily: 'monospace', fontSize: 13 }}>
              <span style={{ color: '#fff', fontWeight: 700 }}>{orderResult.move}</span>
              <span style={{ color: '#6688aa' }}> repeated </span>
              <span style={{ color: '#4dd0ff', fontWeight: 700 }}>{orderResult.order}×</span>
              <span style={{ color: '#6688aa' }}> = identity</span>
              <div style={{ color: '#a0b8cc', fontSize: 11, marginTop: 4 }}>Order = {orderResult.order}</div>
            </div>
          )}
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#556677', marginTop: 8, lineHeight: 1.8 }}>
            <div>ord(R) = 4</div>
            <div>ord(U) = 4</div>
            <div>ord(RU) = 105</div>
          </div>
        </div>

        {/* NON-COMMUTATIVITY */}
        <div>
          <div style={{ color: '#ff8844', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Non-Commutativity
          </div>
          <div style={{ color: '#8899aa', fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>
            Try the same two moves in different order:
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button
              onClick={doRthenU}
              style={{
                flex: 1, padding: '7px 8px', borderRadius: 6,
                border: '1px solid rgba(77,208,255,0.3)',
                background: 'rgba(77,208,255,0.08)',
                color: '#4dd0ff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace',
              }}
            >
              R then U
            </button>
            <button
              onClick={doUthenR}
              style={{
                flex: 1, padding: '7px 8px', borderRadius: 6,
                border: '1px solid rgba(255,136,68,0.3)',
                background: 'rgba(255,136,68,0.08)',
                color: '#ff8844', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace',
              }}
            >
              U then R
            </button>
          </div>
          {rxuResult && (rxuResult.ru || rxuResult.ur) && (
            <div style={{ background: 'rgba(255,136,68,0.06)', border: '1px solid rgba(255,136,68,0.2)', borderRadius: 8, padding: 10 }}>
              {rxuResult.ru && rxuResult.ur && (
                <div>
                  <div style={{ color: '#ff8844', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                    R∘U ≠ U∘R ✓ Confirmed!
                  </div>
                  <div style={{ color: '#c0d8e8', fontSize: 12, marginBottom: 8, lineHeight: 1.5 }}>
                    The two operations produce <strong style={{ color: '#fff' }}>different cube states</strong> — just like matrix multiplication where AB ≠ BA in general.
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <div style={{ background: 'rgba(77,208,255,0.08)', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
                      <div style={{ color: '#4dd0ff', fontSize: 11, fontWeight: 700, marginBottom: 3 }}>R then U</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#667788' }}>
                        U-face: {rxuResult.ru.slice(0,9).join(' ')}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255,136,68,0.08)', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
                      <div style={{ color: '#ff8844', fontSize: 11, fontWeight: 700, marginBottom: 3 }}>U then R</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#667788' }}>
                        U-face: {rxuResult.ur.slice(0,9).join(' ')}
                      </div>
                    </div>
                  </div>
                  <div style={{ color: '#445566', fontSize: 10, marginTop: 6 }}>U-face stickers differ between the two — they are not equal</div>
                </div>
              )}
              {!(rxuResult.ru && rxuResult.ur) && (
                <div style={{ color: '#8899aa', fontSize: 11 }}>Try both buttons to compare results</div>
              )}
            </div>
          )}
        </div>

        {/* GROUP THEORY */}
        <div>
          <div style={{ color: '#4dd0ff', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Group Theory
          </div>
          <div style={{
            background: 'rgba(77,208,255,0.04)',
            border: '1px solid rgba(77,208,255,0.12)',
            borderRadius: 8,
            padding: 12,
            fontFamily: 'monospace',
            fontSize: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: '#6688aa' }}>Moves from solved:</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>{history.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: '#6688aa' }}>Session total:</span>
              <span style={{ color: '#4dd0ff', fontWeight: 700 }}>{sessionMoves}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: '#6688aa' }}>State:</span>
              <span style={{ color: isSolved(state) ? '#4ade80' : '#ff8844', fontWeight: 700 }}>
                {isSolved(state) ? 'Solved' : 'Scrambled'}
              </span>
            </div>
            <div style={{ borderTop: '1px solid rgba(77,208,255,0.1)', marginTop: 8, paddingTop: 8 }}>
              <div style={{ color: '#446677', fontSize: 10, marginBottom: 4 }}>Group order:</div>
              <div style={{ color: '#4dd0ff', fontSize: 10 }}>|G| = 43,252,003,274,489,856,000</div>
            </div>
          </div>
        </div>

        {/* COMMUTATOR */}
        <div>
          <div style={{ color: '#c084fc', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Commutator
          </div>
          <div style={{ color: '#8899aa', fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>
            The commutator <span style={{ fontFamily: 'monospace', color: '#c084fc' }}>[R,U] = R U R′ U′</span> is the "sexy move" — a key building block for solving. Applied 6 times it returns to solved.
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#6644aa', marginBottom: 10, lineHeight: 1.8 }}>
            <div>[R,U]¹ → moves 8 pieces</div>
            <div>[R,U]⁶ → identity (solved)</div>
          </div>
          <button
            onClick={doCommutator}
            disabled={scrambling}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid rgba(192,132,252,0.3)',
              background: 'rgba(192,132,252,0.08)',
              color: '#c084fc',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >
            Execute [R, U] = R U R′ U′
          </button>
        </div>

        {/* God's Number */}
        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid rgba(77,208,255,0.1)' }}>
          <div style={{ color: '#334455', fontSize: 10, lineHeight: 1.6, fontFamily: 'monospace' }}>
            <div style={{ color: '#4dd0ff', marginBottom: 4 }}>God's Number = 20</div>
            <div>Any position solvable in ≤ 20 moves.</div>
            <div>Proved 2010 (Rokicki et al.), 35 CPU-years.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
