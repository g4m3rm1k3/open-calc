# opencalc.py — Python visualization library for open-calc
# Students import this inside the Pyodide notebook.
# Nothing here draws anything — it serializes to JSON.
# The JavaScript FigureRenderer does all the actual drawing.

import json
import math

# ── Color aliases ─────────────────────────────────────────────────────────────
# Students use friendly names; the JS layer maps them to theme tokens.
# Any CSS color string also works ('red', '#ff0000', 'rgba(255,0,0,0.5)').
BLUE   = 'blue'
AMBER  = 'amber'
GREEN  = 'green'
RED    = 'red'
PURPLE = 'purple'
TEAL   = 'teal'
GRAY   = 'gray'

# ── Element builders ──────────────────────────────────────────────────────────

class Figure:
    """
    A Figure is a collection of drawable elements.
    Call methods to add elements, then call .show() to render.

    Example:
        fig = Figure()
        fig.grid()
        fig.arrow([0, 0], [3, 2], color='blue', label='v')
        fig.point([3, 2], color='amber', label='tip')
        fig.show()
    """

    def __init__(self, width=None, height=None, square=False,
                 xmin=-5, xmax=5, ymin=-5, ymax=5, title=None):
        """
        width, height: canvas size in pixels. None = fill container.
        square: if True, forces 1:1 aspect ratio (good for coordinate geometry).
        xmin, xmax, ymin, ymax: data coordinate range.
        title: optional title string shown above canvas.
        """
        self._elements = []
        self._width = width
        self._height = height
        self._square = square
        self._xmin = xmin
        self._xmax = xmax
        self._ymin = ymin
        self._ymax = ymax
        self._title = title

    # ── Grid and axes ─────────────────────────────────────────────────────────

    def grid(self, step=1, color='border'):
        """Draw a coordinate grid. step = spacing between grid lines."""
        self._elements.append({
            'type': 'grid',
            'step': step,
            'color': color,
        })
        return self

    def axes(self, labels=True, ticks=True, xmin=None, xmax=None, ymin=None, ymax=None):
        """Draw x and y axes with optional labels and tick marks.
        Passing xmin/xmax/ymin/ymax overrides the bounds set in the constructor."""
        if xmin is not None: self._xmin = xmin
        if xmax is not None: self._xmax = xmax
        if ymin is not None: self._ymin = ymin
        if ymax is not None: self._ymax = ymax
        self._elements.append({
            'type': 'axes',
            'labels': labels,
            'ticks': ticks,
        })
        return self

    # ── Arrows and vectors ────────────────────────────────────────────────────

    def arrow(self, start, end, color='blue', label=None,
              width=2.5, dashed=False, alpha=1.0):
        """
        Draw an arrow from start to end.
        start, end: [x, y] in data coordinates.
        label: string shown near the arrowhead.
        """
        self._elements.append({
            'type': 'arrow',
            'start': list(start),
            'end': list(end),
            'color': color,
            'label': label,
            'width': width,
            'dashed': dashed,
            'alpha': alpha,
        })
        return self

    def vector(self, v, color='blue', label=None, origin=None, width=2.5):
        """
        Draw a vector from origin (default [0,0]).
        v: [x, y] components.
        """
        ox, oy = (origin or [0, 0])
        self._elements.append({
            'type': 'arrow',
            'start': [ox, oy],
            'end': [ox + v[0], oy + v[1]],
            'color': color,
            'label': label or f'[{v[0]}, {v[1]}]',
            'width': width,
            'dashed': False,
            'alpha': 1.0,
        })
        return self

    # ── Points ────────────────────────────────────────────────────────────────

    def point(self, pos, color='amber', label=None, radius=6):
        """Draw a dot at pos = [x, y]."""
        self._elements.append({
            'type': 'point',
            'pos': list(pos),
            'color': color,
            'label': label,
            'radius': radius,
        })
        return self

    # ── Lines and segments ────────────────────────────────────────────────────

    def line(self, start, end, color='muted', width=1.5, dashed=False, alpha=1.0):
        """Draw a line segment (no arrowhead)."""
        self._elements.append({
            'type': 'line',
            'start': list(start),
            'end': list(end),
            'color': color,
            'width': width,
            'dashed': dashed,
            'alpha': alpha,
        })
        return self

    def hline(self, y, color='muted', width=1, dashed=True):
        """Horizontal line at y across the full plot range."""
        self._elements.append({
            'type': 'line',
            'start': [self._xmin, y],
            'end': [self._xmax, y],
            'color': color,
            'width': width,
            'dashed': dashed,
            'alpha': 0.7,
        })
        return self

    def vline(self, x, color='muted', width=1, dashed=True):
        """Vertical line at x across the full plot range."""
        self._elements.append({
            'type': 'line',
            'start': [x, self._ymin],
            'end': [x, self._ymax],
            'color': color,
            'width': width,
            'dashed': dashed,
            'alpha': 0.7,
        })
        return self

    # ── Curves ────────────────────────────────────────────────────────────────

    def plot(self, fn, xmin=None, xmax=None, steps=300,
             color='blue', width=2.5, label=None, fill=False, fill_alpha=0.15, dashed=False):
        """
        Plot a function y = fn(x).
        fn: a callable taking a single float, returning a float.
        fill: if True, fill area under the curve down to y=0.
        """
        x0 = xmin if xmin is not None else self._xmin
        x1 = xmax if xmax is not None else self._xmax
        xs = [x0 + (x1 - x0) * i / steps for i in range(steps + 1)]
        ys = []
        for x in xs:
            try:
                y = fn(x)
                ys.append(float('inf') if y != y else y)  # handle nan
            except Exception:
                ys.append(None)
        self._elements.append({
            'type': 'curve',
            'xs': xs,
            'ys': ys,
            'color': color,
            'width': width,
            'label': label,
            'fill': fill,
            'fill_alpha': fill_alpha,
            'dashed': dashed,
        })
        return self

    def scatter(self, xs, ys, color='blue', radius=4, labels=None, size=None):
        """Scatter plot of points. `size` is an alias for `radius`."""
        r = size if size is not None else radius
        self._elements.append({
            'type': 'scatter',
            'xs': list(xs),
            'ys': list(ys),
            'color': color,
            'radius': r,
            'labels': labels,
        })
        return self

    def parametric(self, xfn, yfn, tmin=0, tmax=2*math.pi,
                   steps=300, color='purple', width=2):
        """
        Parametric curve: x = xfn(t), y = yfn(t).
        Example: unit circle
            fig.parametric(math.cos, math.sin)
        """
        ts = [tmin + (tmax - tmin) * i / steps for i in range(steps + 1)]
        xs, ys = [], []
        for t in ts:
            try: xs.append(xfn(t))
            except: xs.append(None)
            try: ys.append(yfn(t))
            except: ys.append(None)
        self._elements.append({
            'type': 'curve',
            'xs': xs,
            'ys': ys,
            'color': color,
            'width': width,
            'label': None,
            'fill': False,
            'fill_alpha': 0,
        })
        return self

    # ── Regions ───────────────────────────────────────────────────────────────

    def fill_between(self, fn_top, fn_bottom=None, xmin=None, xmax=None,
                     color='blue', alpha=0.2, steps=200):
        """
        Fill the region between fn_top and fn_bottom (default y=0).
        """
        x0 = xmin if xmin is not None else self._xmin
        x1 = xmax if xmax is not None else self._xmax
        xs = [x0 + (x1 - x0) * i / steps for i in range(steps + 1)]
        tops, bottoms = [], []
        for x in xs:
            try: tops.append(fn_top(x))
            except: tops.append(None)
            if fn_bottom:
                try: bottoms.append(fn_bottom(x))
                except: bottoms.append(None)
            else:
                bottoms.append(0)
        self._elements.append({
            'type': 'region',
            'xs': xs,
            'tops': tops,
            'bottoms': bottoms,
            'color': color,
            'alpha': alpha,
        })
        return self

    # ── Text ──────────────────────────────────────────────────────────────────

    def text(self, x_or_pos, y_or_content, content_or_color=None, color='text', size=13, align='center', bold=False):
        """Draw text. Supports text(x, y, content) and text([x, y], content)."""
        if isinstance(x_or_pos, (int, float)):
            pos = [x_or_pos, y_or_content]
            txt = content_or_color
        else:
            pos = list(x_or_pos)
            txt = y_or_content
        self._elements.append({
            'type': 'text',
            'pos': pos,
            'content': str(txt),
            'color': color,
            'size': size,
            'align': align,
            'bold': bold,
        })
        return self

    # ── Polygons and shapes ───────────────────────────────────────────────────

    def polygon(self, points, color='blue', fill=True, alpha=0.2,
                stroke=True, stroke_width=1.5):
        """
        Draw a filled/stroked polygon.
        points: list of [x, y] pairs.
        """
        self._elements.append({
            'type': 'polygon',
            'points': [list(p) for p in points],
            'color': color,
            'fill': fill,
            'alpha': alpha,
            'stroke': stroke,
            'stroke_width': stroke_width,
        })
        return self

    def rect(self, x, y, w, h, color='blue', fill=True, alpha=0.2):
        """Draw a rectangle. x, y = bottom-left corner. w, h = width, height."""
        pts = [[x, y], [x+w, y], [x+w, y+h], [x, y+h]]
        return self.polygon(pts, color=color, fill=fill, alpha=alpha)

    def circle(self, center, radius, color='blue', fill=False,
               alpha=0.2, steps=60):
        """Draw a circle."""
        pts = [
            [center[0] + radius * math.cos(2 * math.pi * i / steps),
             center[1] + radius * math.sin(2 * math.pi * i / steps)]
            for i in range(steps + 1)
        ]
        self._elements.append({
            'type': 'polygon',
            'points': pts,
            'color': color,
            'fill': fill,
            'alpha': alpha,
            'stroke': True,
            'stroke_width': 1.5,
        })
        return self

    # ── Transformed grid (for linear algebra) ────────────────────────────────

    def transformed_grid(self, matrix, color_h='blue', color_v='green',
                         range_=5, alpha=0.7):
        """
        Draw a grid distorted by a 2x2 matrix.
        matrix: [[a, b], [c, d]] where columns are where i-hat and j-hat land.
        Use for visualising linear transformations.

        Example — 90° rotation:
            fig.transformed_grid([[0, -1], [1, 0]])
        """
        a, b = matrix[0]
        c, d = matrix[1]
        self._elements.append({
            'type': 'transformed_grid',
            'a': a, 'b': b, 'c': c, 'd': d,
            'range': range_,
            'color_h': color_h,
            'color_v': color_v,
            'alpha': alpha,
        })
        return self

    # ── Riemann sums ──────────────────────────────────────────────────────────

    def riemann(self, fn, a, b, n=10, method='midpoint', color='blue', alpha=0.3):
        """
        Draw Riemann sum rectangles.
        method: 'left' | 'right' | 'midpoint'
        """
        rects = []
        width = (b - a) / n
        for i in range(n):
            x_left = a + i * width
            if method == 'left':
                x_eval = x_left
            elif method == 'right':
                x_eval = x_left + width
            else:
                x_eval = x_left + width / 2
            try:
                h = fn(x_eval)
                rects.append({'x': x_left, 'w': width, 'h': h})
            except:
                pass
        self._elements.append({
            'type': 'riemann',
            'rects': rects,
            'color': color,
            'alpha': alpha,
        })
        return self

    # ── Tangent line ──────────────────────────────────────────────────────────

    def tangent(self, fn, x0, length=2, color='amber', width=2, label=None):
        """
        Draw the tangent line to fn at x=x0.
        Computes slope numerically.
        """
        dx = 1e-5
        slope = (fn(x0 + dx) - fn(x0 - dx)) / (2 * dx)
        y0 = fn(x0)
        x1 = x0 - length / 2
        x2 = x0 + length / 2
        self._elements.append({
            'type': 'tangent',
            'x0': x0, 'y0': y0, 'slope': slope,
            'x1': x1, 'x2': x2,
            'color': color,
            'width': width,
            'label': label or f"slope = {slope:.3f}",
        })
        return self

    # ── Bar chart ─────────────────────────────────────────────────────────────

    def bars(self, labels, values, color='blue', alpha=0.8):
        """
        Simple bar chart. labels = list of strings, values = list of numbers.
        Switches the figure to bar-chart mode (different coordinate system).
        """
        self._elements.append({
            'type': 'bars',
            'labels': [str(l) for l in labels],
            'values': [float(v) for v in values],
            'color': color,
            'alpha': alpha,
        })
        return self

    def histogram(self, data=None, bins=10, color='blue', alpha=0.7, density=False, values=None):
        """
        Compute a histogram from raw data and add it as a drawable element.
        Pass either data= or values= (alias).

        Args:
            data:    list or array of numeric values (also accepted as values=)
            bins:    number of equal-width bins (default 10)
            color:   bar fill color token (default 'blue')
            alpha:   opacity 0-1 (default 0.7)
            density: if True, y-axis shows probability density instead of counts

        Example:
            import random
            data = [random.gauss(0, 1) for _ in range(500)]
            fig = Figure(xmin=-4, xmax=4, title='Normal distribution')
            fig.histogram(data, bins=20)
            fig.show()
        """
        data = data if data is not None else values
        if not data:
            return self
        mn, mx = min(data), max(data)
        if mn == mx:
            mn -= 0.5; mx += 0.5
        bw = (mx - mn) / bins
        counts = [0] * bins
        for v in data:
            idx = min(int((v - mn) / bw), bins - 1)
            counts[idx] += 1
        if density:
            tot = sum(counts)
            counts = [c / (tot * bw) for c in counts]
        edges = [mn + i * bw for i in range(bins + 1)]
        self._elements.append({
            'type': 'histogram',
            'edges': edges,
            'counts': counts,
            'color': color,
            'alpha': alpha,
            'density': density,
            'xmin': mn,
            'xmax': mx,
        })
        return self

    def boxplot(self, data, x=0.5, width=0.35, color='blue', label=None):
        """
        Draw a box-and-whisker plot for a numeric dataset.

        Args:
            data:   list or array of numeric values
            x:      horizontal centre position in figure coordinates (default 0.5)
            width:  half-width of the box in figure x-units (default 0.35)
            color:  color token (default 'blue')
            label:  optional text label shown below the box

        Set Figure ymin/ymax to cover the data range.

        Example:
            data = [12, 15, 14, 10, 18, 35, 9, 14, 16, 21]
            fig = Figure(xmin=0, xmax=1, ymin=0, ymax=40, title='Boxplot')
            fig.boxplot(data, x=0.5, width=0.3, color='blue')
            fig.show()
        """
        s = sorted(data)
        n = len(s)
        def pct(p):
            idx = p / 100 * (n - 1)
            lo = int(idx); hi = min(lo + 1, n - 1)
            return s[lo] + (s[hi] - s[lo]) * (idx - lo)
        q1, med, q3 = pct(25), pct(50), pct(75)
        iqr = q3 - q1
        lf, uf = q1 - 1.5 * iqr, q3 + 1.5 * iqr
        lw = min(v for v in s if v >= lf)
        uw = max(v for v in s if v <= uf)
        outliers = [v for v in s if v < lf or v > uf]
        self._elements.append({
            'type': 'boxplot',
            'x': x,
            'xmax': self._xmax,
            'width': width,
            'color': color,
            'q1': q1,
            'median': med,
            'q3': q3,
            'lower_whisker': lw,
            'upper_whisker': uw,
            'outliers': outliers,
            'label': label,
            'ymin': self._ymin,
            'ymax': self._ymax,
        })
        return self

    def pie(self, labels, values, colors=None):
        """
        Draw a pie chart.

        Args:
            labels: list of category name strings
            values: list of numeric values (need not sum to 100)
            colors: optional list of color tokens; cycles through theme palette if omitted

        Example:
            fig = Figure(title='Market Share')
            fig.pie(['A', 'B', 'C'], [45, 30, 25])
            fig.show()
        """
        self._elements.append({
            'type': 'pie',
            'labels': [str(l) for l in labels],
            'values': [float(v) for v in values],
            'colors': colors,
        })
        return self

    # ── Serialise and show ────────────────────────────────────────────────────

    def show(self):
        """
        Returns the figure as a JSON string.
        The notebook intercepts this and renders it on canvas.
        Do NOT print() this — just return it as the last expression in a cell.

        Example usage in notebook cell:
            fig = Figure()
            fig.grid()
            fig.plot(lambda x: x**2, color='blue')
            fig.show()   ← last line, no print()
        """
        data = {
            'type': 'opencalc_figure',
            'width': self._width,
            'height': self._height,
            'square': self._square,
            'xmin': self._xmin,
            'xmax': self._xmax,
            'ymin': self._ymin,
            'ymax': self._ymax,
            'title': self._title,
            'elements': self._elements,
        }
        return json.dumps(data)


# ── Convenience functions ─────────────────────────────────────────────────────
# For students who want one-liners instead of the builder API.

def quick_plot(fn, xmin=-5, xmax=5, color='blue', label=None, title=None):
    """Plot a single function quickly."""
    fig = Figure(xmin=xmin, xmax=xmax,
                 ymin=-10, ymax=10, title=title)
    fig.grid().axes()
    fig.plot(fn, color=color, label=label)
    return fig.show()

def quick_vectors(*vectors, labels=None):
    """Plot multiple vectors from the origin."""
    colors = ['blue', 'amber', 'green', 'red', 'purple', 'teal']
    fig = Figure(square=True, xmin=-6, xmax=6, ymin=-6, ymax=6)
    fig.grid().axes()
    for i, v in enumerate(vectors):
        lbl = labels[i] if labels and i < len(labels) else f'v{i+1}'
        fig.vector(v, color=colors[i % len(colors)], label=lbl)
    return fig.show()

def quick_transform(matrix, vector=None):
    """Show a linear transformation with the transformed grid."""
    fig = Figure(square=True, xmin=-5, xmax=5, ymin=-5, ymax=5)
    fig.grid()
    fig.transformed_grid(matrix)
    a, b = matrix[0]; c, d = matrix[1]
    fig.vector([a, b], color='red', label='î→')
    fig.vector([c, d], color='green', label='ĵ→')
    if vector:
        vx, vy = vector
        fig.vector([vx, vy], color='purple', label='v', alpha=0.4)
        fig.vector([a*vx + c*vy, b*vx + d*vy], color='purple', label='Tv')
    return fig.show()
