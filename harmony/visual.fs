fragColor.xyz *= exp(-0.005*pow(dist, 1.6))/1.5;
fragColor.xyz -= 0.02*v_normal;


}