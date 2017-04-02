// (c) Copyright 2016, Sean Connelly (@voidqk), http://syntheti.cc
// MIT License
// Project Home: https://github.com/voidqk/polybooljs

//
// provides the raw computation functions that takes epsilon into account
//
// zero is defined to be between (-epsilon, epsilon) exclusive
//

function Epsilon(eps){
	if (typeof eps !== 'number')
		eps = 0.0000000001; // sane default? sure why not
	var my = {
		epsilon: function(v){
			if (typeof v === 'number')
				eps = v;
			return eps;
		},
		round: function(v){
			var factor = 1 / eps;
			return Math.round(v * factor) / factor;
		},
		delta: function(v1, v2){
			return my.round(v2 - v1);
		},
		equal: function(v1, v2){
			return my.delta(v1, v2) === 0;
		},
		deltaX: function(p1, p2){
			return my.delta(p1[0], p2[0]);
		},
		deltaY: function(p1, p2){
			return my.delta(p1[1], p2[1]);
		},
		slope: function(p1, p2){
			return my.deltaY(p1, p2) / my.deltaX(p1, p2);
		},
		slopesDelta: function(a0, a1, b0, b1){
			return my.delta(my.slope(a0, a1), my.slope(b0, b1));
		},
		slopesEqual: function(a0, a1, b0, b1){
			return my.slopesDelta(a0, a1, b0, b1) === 0;
		},
		pointAboveOrOnLine: function(p, left, right){
			return my.slope(left, right) <= my.slope(left, p);
		},
		pointBetween: function(p, left, right){
			// p must be collinear with left->right
			// returns false if p == left, p == right, or left == right
			return my.slopesEqual(left, right, left, p) &&
				!(my.pointsSame(left, right)) &&
				(my.deltaX(left, p) > 0 && my.deltaY(left, p) > 0) &&
				(my.deltaX(right, p) < 0 && my.deltaY(right, p) < 0);
		},
		pointsSameX: function(p1, p2){
			return my.deltaX(p1, p2) === 0;
		},
		pointsSameY: function(p1, p2){
			return my.deltaY(p1, p2) === 0;
		},
		pointsSame: function(p1, p2){
			return my.pointsSameX(p1, p2) && my.pointsSameY(p1, p2);
		},
		pointsCompare: function(p1, p2){
			// returns -1 if p1 is smaller, 1 if p2 is smaller, 0 if equal
			if (my.pointsSameX(p1, p2))
				return my.pointsSameY(p1, p2) ? 0 : (my.deltaY(p1, p2) > 0 ? -1 : 1);
			return my.deltaX(p1, p2) > 0 ? -1 : 1;
		},
		pointsCollinear: function(p1, p2, p3){
			// does p1->p2->p3 make a straight line?
			// essentially this is just checking to see if the slope(p1->p2) === slope(p2->p3)
			// if slopes are equal, then they must be collinear, because they share p2
			return my.pointsSame(p1, p2) || my.pointsSame(p2, p3) || my.pointsSame(p1, p3) || my.slopesEqual(p1, p2, p2, p3);
		},
		linesIntersect: function(a0, a1, b0, b1){
			// returns false if the lines are coincident (e.g., parallel or on top of each other)
			//
			// returns an object if the lines intersect:
			//   {
			//     pt: [x, y],    where the intersection point is at
			//     alongA: where intersection point is along A,
			//     alongB: where intersection point is along B
			//   }
			//
			//  alongA and alongB will each be one of: -2, -1, 0, 1, 2
			//
			//  with the following meaning:
			//
			//    -2   intersection point is before segment's first point
			//    -1   intersection point is directly on segment's first point
			//     0   intersection point is between segment's first and second points (exclusive)
			//     1   intersection point is directly on segment's second point
			//     2   intersection point is after segment's second point
			if (my.slopesEqual(a0, a1, b0, b1))
				return false; // lines are coincident

			var pt = my.intersectionPoint(a0, a1, b0, b1)
			return {
				pt: pt,
				alongA: my.intersectionAlong(pt, a0, a1),
				alongB: my.intersectionAlong(pt, b0, b1),
			};
		},
		intersectionPoint: function(a0, a1, b0, b1) {
			var adx = my.deltaX(a0, a1);
			var ady = my.deltaY(a0, a1);
			var bdx = my.deltaX(b0, b1);
			var bdy = my.deltaY(b0, b1);

			var axb = adx * bdy - ady * bdx;

			var dx = my.deltaX(b0, a0);
			var dy = my.deltaY(b0, a0);

			var A = (bdx * dy - bdy * dx) / axb;

			return [
				a0[0] + A * adx,
				a0[1] + A * ady
			];
		},
		intersectionAlong: function(pt, left, right) {
			var p = pt[0];
			var l = left[0];
			var r = right[0];
			// Default compare on X coodinates and if they are the same (vertical line), compare on Ys.
			if (my.equal(l, r)) {
				p = pt[1];
				l = left[1];
				r = right[1];
			}
			if (my.delta(p, l) > 0)
				return -2;
			else if (my.equal(p, l))
				return -1;
			else if (my.delta(p, l) < 0 && my.delta(p, r) > 0)
				return 0;
			else if (my.equal(p, r))
				return 1;
			else
				return 2;
		}
	};
	return my;
}

module.exports = Epsilon;
