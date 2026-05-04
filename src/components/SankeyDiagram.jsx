import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey as d3Sankey, sankeyLinkHorizontal } from 'd3-sankey';

const nodeColors = {
  'Feedstock Input': '#DAA520',
  'Anaerobic Digestion': '#00d4ff',
  'Raw Biogas': '#00ff88',
  'Gas Upgrading': '#8b5cf6',
  'Biomethane': '#00ff88',
  'CHP Generation': '#ff8800',
  'Electricity': '#ffcc00',
  'Process Heat': '#ff4444',
  'Digestate': '#8B4513',
  'CO2 Stream': '#6b7280',
};

export default function SankeyDiagram({ data }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };

    const nodeMap = new Map(data.nodes.map((n, i) => [n.id, i]));

    const sankeyData = {
      nodes: data.nodes.map((n) => ({ ...n })),
      links: data.links.map((l) => ({
        source: nodeMap.get(l.source),
        target: nodeMap.get(l.target),
        value: l.value,
        unit: l.unit,
      })),
    };

    const sankeyGenerator = d3Sankey()
      .nodeWidth(20)
      .nodePadding(20)
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ]);

    const { nodes, links } = sankeyGenerator(sankeyData);

    const defs = svg.append('defs');

    links.forEach((link, i) => {
      const gradient = defs
        .append('linearGradient')
        .attr('id', `gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', link.source.x1)
        .attr('x2', link.target.x0);

      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', nodeColors[link.source.name] || '#00d4ff')
        .attr('stop-opacity', 0.8);

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', nodeColors[link.target.name] || '#00d4ff')
        .attr('stop-opacity', 0.8);
    });

    const linkGroup = svg.append('g').attr('class', 'links');

    linkGroup
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('fill', 'none')
      .attr('stroke', (d, i) => `url(#gradient-${i})`)
      .attr('stroke-width', (d) => Math.max(1, d.width))
      .attr('stroke-opacity', 0.5)
      .on('mouseover', function (event, d) {
        d3.select(this).attr('stroke-opacity', 0.8);
        tooltip
          .style('opacity', 1)
          .html(
            `<strong>${d.source.name} → ${d.target.name}</strong><br/>${d.value.toLocaleString()} ${d.unit}`
          )
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', function () {
        d3.select(this).attr('stroke-opacity', 0.5);
        tooltip.style('opacity', 0);
      });

    const nodeGroup = svg.append('g').attr('class', 'nodes');

    nodeGroup
      .selectAll('rect')
      .data(nodes)
      .join('rect')
      .attr('x', (d) => d.x0)
      .attr('y', (d) => d.y0)
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => Math.max(1, d.y1 - d.y0))
      .attr('fill', (d) => nodeColors[d.name] || '#00d4ff')
      .attr('rx', 3)
      .attr('stroke', '#0a0a0f')
      .attr('stroke-width', 2);

    nodeGroup
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', (d) => (d.x0 < width / 2 ? d.x0 - 8 : d.x1 + 8))
      .attr('y', (d) => (d.y0 + d.y1) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d) => (d.x0 < width / 2 ? 'end' : 'start'))
      .attr('fill', '#e5e5e5')
      .attr('font-size', '12px')
      .attr('font-family', 'Inter, sans-serif')
      .text((d) => d.name);

    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'sankey-tooltip')
      .style('position', 'absolute')
      .style('padding', '8px 12px')
      .style('background', '#1a1a24')
      .style('border', '1px solid #2a2a38')
      .style('border-radius', '8px')
      .style('color', '#e5e5e5')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000);

    return () => {
      tooltip.remove();
    };
  }, [data]);

  return (
    <svg
      ref={svgRef}
      style={{
        width: '100%',
        height: '100%',
        background: 'transparent',
      }}
    />
  );
}
