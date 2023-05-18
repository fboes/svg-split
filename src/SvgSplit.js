export class SvgSplit {
  constructor(svgData) {
    const data = this.cleanup(svgData);
    this.parts = data.match(/^(.+?<svg[^>]+>)(.+)(<\/svg>\s+)$/ms);
    if (!this.parts) {
      throw new Error('No SVG structure found in file');
    }

    this.elements = [...this.parts[2].matchAll(/<[^>]+>/gms)];
  }

  cleanup(svgData) {
    return svgData
      .replace(/<(clipPath|defs).+?\/\1>/gms, "")
      .replace(/\s+(sodipodi|inkscape):(\S+)="[^"]*"/gm, "")
      .replace(/\s+xmlns:(sodipodi|inkscape)="[^"]*"/gm, "")
      .replace(/\s+<\/?(g|image|defs|!--)(\s+[^>]+)?>/gm, "")
      .replace(/\s+<\/?(sodipodi|inkscape):[a-zA-Z]+(\s+[^>]+)?>/gm, "")
      .replace(/(\s+style=")(.*?)(")/gm, function (all, pre, style, post) {
        const colorMatch = style.match(/#[a-fA-F0-9]{3,6}/);
        const color = colorMatch ? colorMatch[0] : "#000000";
        return pre + "fill-rule:evenodd;stroke:none;fill:" + color + post;
      })
    ;
  }

  applyCookieCutter() {
    const svgElementRectangleIndex = this.elements.findIndex((svgElement) => {
      return svgElement[0].match(/<rect/);
    });
    if (svgElementRectangleIndex < 0) {
      return false;
    }

    // Build cookie cutter
    const svgElementRectangle = this.elements[svgElementRectangleIndex];
    const x = Number(svgElementRectangle[0].match(/\sx="(.+?)"/)[1]);
    const y = Number(svgElementRectangle[0].match(/\sy="(.+?)"/)[1]);
    const width = Number(svgElementRectangle[0].match(/\swidth="(.+?)"/)[1]);
    const height = Number(svgElementRectangle[0].match(/\sheight="(.+?)"/)[1]);

    if (!width || !height) {
      console.log(svgElementRectangle[0]);
      throw new Error('No width or height found in cookie cutter rectangle');
    }

    // Remove cookie cutter source
    this.elements.splice(svgElementRectangleIndex, 1);

    const rectangle = `M ${x},${y} h ${width} v ${height} H ${x} Z`;
    this.elements = this.elements
      .map((svgElement) => {
        const dPart = svgElement[0].match(/\sd=".+?,([0-9.]+)/);
        if (!dPart) {
          // no `d` attribute, cannot cut
          return svgElement;
        }

        const pathY = Number(dPart[1]);
        if (pathY > y) {
          // Add cookie cutter to all elements which might intersect with it
          svgElement[0] = svgElement[0].replace(/(\sd=".+?)(")/, `$1\n${rectangle}$2`);
        }

        return svgElement;
      })
    ;

    return true;
  }

  convertColorCode(color) {
    switch (color) {
      case 'red': color = '#ff0000'; break;
      case 'green': color = '#00ff00'; break;
      case 'blue': color = '#0000ff'; break;
      case 'cyan': color = '#00ffff'; break;
      case 'magenta': color = '#ff00ff'; break;
      case 'yellow': color = '#ffff00'; break;
      case 'black': color = '#000000'; break;
      case 'white': color = '#ffffff'; break;

    }
    return color;
  }

  filter(filter) {
    const filterRegEx = new RegExp(filter);
    this.elements = this.elements.filter((svgElement) => {
      return filterRegEx.test(svgElement);
    });
  }

  get fileData() {
    return this.elements.map((el) => {
      return this.parts[1] + "\n  " + el[0] + "\n" + this.parts[3];
    })
  }
}
