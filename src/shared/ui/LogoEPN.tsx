import React from 'react';
import { Image, StyleSheet } from 'react-native';

type LogoSize = 'pequeno' | 'mediano' | 'grande';

interface Props {
  size?: LogoSize;
}

const SIZE_MAP: Record<LogoSize, number> = {
  pequeno: 72,
  mediano: 120,
  grande: 160,
};

export function LogoEPN({ size = 'mediano' }: Props) {
  const dimension = SIZE_MAP[size];

  return <Image source={require('../../../assets/images/epn.png')} style={[styles.logo, { width: dimension, height: dimension }]} resizeMode="contain" />;
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
  },
});
